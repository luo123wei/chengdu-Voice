export function compressImage(file: File, maxSize: number = 1920, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    
    img.onload = () => {
      let { width, height } = img;
      
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }
      
      if (width > height) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else {
        width = (width / height) * maxSize;
        height = maxSize;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    reader.onerror = () => reject(new Error('文件读取失败'));
    
    reader.readAsDataURL(file);
  });
}

export function compressImageToFile(file: File, maxSize: number = 1920, quality: number = 0.85): Promise<File> {
  return compressImage(file, maxSize, quality).then(
    (blob) => new File([blob], file.name, { type: file.type })
  );
}