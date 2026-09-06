'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Pause, X, ChevronRight, ChevronLeft, MapPin, Check, Volume2, Mail, Clock } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { playScene, stopScene, onPlayingChange } from '@/lib/soundscapeEngine';

const ITEMS_PER_PAGE = 12;

/* ---------- 后台「声音管理」发布的实录音频 ---------- */
interface DbSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
  culturalStory?: string;
}

type SoundItem =
  | ({ kind: 'synth' } & Soundscape)
  | ({ kind: 'audio' } & DbSound);

/* ---------- 六段合成音景 + 双语文案 ---------- */
interface Soundscape {
  id: string;
  title: string;
  titleEn: string;
  location: string;
  tags: string;
  desc: string;
  descEn: string;
  story: string;
  storyEn: string;
  product: { href: string; label: string; labelEn: string };
}

const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'teahouse',
    title: '盖碗茶馆',
    titleEn: 'Teahouse Murmur',
    location: '人民公园 · 鹤鸣茶社',
    tags: '盖碗 · 竹椅 · 满堂人声',
    desc: '盖碗轻碰、竹椅吱呀、满堂压低的人声。成都的茶馆不是景点,是城市的客厅。',
    descEn: 'Gaiwan clinks, bamboo chairs, a room full of low conversation. The teahouse is Chengdu’s living room.',
    story: '在鹤鸣茶社,一杯盖碗茶可以坐一下午。掺茶的铜壶从肩上掠过,盖碗与茶托碰出轻响,邻座的大爷摆着龙门阵——这声音不吵,它像一条毯子,盖住成都所有的慢。',
    storyEn: 'At Heming Teahouse, one bowl of tea lasts an entire afternoon. The copper kettle pours over the shoulder, lids tap against saucers, and old men trade stories nearby — the sound is not noise. It is a blanket woven from everything slow about Chengdu.',
    product: { href: '/shop/panda-teapet', label: '听茶声,配一只茶席上的小熊猫', labelEn: 'A little panda for your own tea tray' },
  },
  {
    id: 'rain',
    title: '雨夜锦里',
    titleEn: 'Rain on Old Tiles',
    location: '锦里古街 · 雨夜',
    tags: '雨声 · 青瓦 · 白噪音',
    desc: '成都一年下两百多天雨。雨打在青瓦和石板上,是全城最好的入睡白噪音。',
    descEn: 'It rains over two hundred days a year in Chengdu. Rain on old tiles and flagstones — the city’s favorite lullaby.',
    story: '锦里的夜游客散去后,雨就开始说话。青瓦上密、青石板上脆,偶尔一辆自行车碾过水洼。成都人的安逸,有一半是在雨声里泡出来的。',
    storyEn: 'When the last tourists leave Jinli Street, the rain begins to speak — dense on the tile roofs, crisp on the flagstones, a bicycle crossing a puddle now and then. Half of Chengdu’s famous ease soaks in this sound.',
    product: { href: '/shop/panda-lantern', label: '雨夜需要一盏暖灯:熊猫月灯(投票中)', labelEn: 'A warm light for rainy nights: Panda Moon Lantern — vote now' },
  },
  {
    id: 'bamboo-wind',
    title: '望江竹风',
    titleEn: 'Wind Through Bamboo',
    location: '望江楼公园 · 竹林',
    tags: '竹涛 · 叶沙 · 风声',
    desc: '成都是一座被竹子养着的城市。风过望江楼的竹林,叶子在数成都的节奏。',
    descEn: 'Chengdu is a city raised on bamboo. When the wind crosses the Wangjiang Grove, the leaves count out the rhythm of the city.',
    story: '望江楼公园有两百多种竹子。风来的时候,整片竹林像海一样起伏——竹竿相碰是低音,竹叶摩擦是细碎的沙。成都人把这种声音叫"竹涛",坐在里面,什么都不用想。',
    storyEn: 'Wangjiang Park holds more than two hundred kinds of bamboo. When the wind arrives, the whole grove rises like a sea: the stems groan low, the leaves whisper high. Locals call it “bamboo waves”. Sit inside them, and there is nothing left to think about.',
    product: { href: '/shop/bamboo-ruler', label: '把竹节放进书里:竹节尺(投票中)', labelEn: 'Keep a bamboo joint in your book: Bamboo Joint Ruler — vote now' },
  },
  {
    id: 'river-birds',
    title: '锦江晨鸟',
    titleEn: 'Morning Birds by the River',
    location: '锦江 · 清晨七点',
    tags: '鸟鸣 · 水流 · 晨练',
    desc: '锦江边的清晨:遛鸟的老人、打太极的音乐、水面上的鸟叫,成都从不在早上着急。',
    descEn: 'Early morning on the Jin River: birds above the water, tai-chi music from the bank. Chengdu is never in a hurry — not even at dawn.',
    story: '天刚亮,锦江边就热闹了。遛鸟人把鸟笼挂成一排,笼里的鸟和树上的野鸟隔着笼子对唱;有人在江边读报,有人慢悠悠擦着自行车。这是成都一天里最清醒的声音。',
    storyEn: 'At first light the riverbank wakes: birdcages hang in a row, caged birds trading songs with wild ones in the trees; someone reads the paper, someone polishes a bicycle with no hurry at all. It is the clearest, freshest sound of the Chengdu day.',
    product: { href: '/shop/panda-bookmark', label: '清晨读书的小搭档:熊猫书签套装', labelEn: 'For morning reading: Panda Bookmark Set' },
  },
  {
    id: 'night-market',
    title: '夜市灯火',
    titleEn: 'Night Market Hum',
    location: '玉林路 · 夜市',
    tags: '人声 · 锅气 · 风铃',
    desc: '玉林夜市的嗡鸣:摊主见人喊一声"妹儿吃啥",锅铲声、啤酒碰杯声全混在一起。',
    descEn: 'The hum of the Yulin night market: vendors calling, woks clattering, beer glasses meeting — all folded into one warm noise.',
    story: '成都的夜市从不过分喧闹,它是一种浑厚的嗡鸣——像城市在哼歌。灯一盏盏亮起来,烧烤摊的烟升起来,风铃在摊边叮当。站在里面五分钟,你就饿了。',
    storyEn: 'A Chengdu night market is never loud, exactly — it hums, like the city singing to itself. The lights come on one by one, smoke rises from the grills, a wind chime ticks by the stall. Stand in it for five minutes and you are hungry.',
    product: { href: '/shop/rong-tote', label: '逛夜市的包:蓉云帆布袋', labelEn: 'The bag for market nights: Rong Cloud Tote' },
  },
  {
    id: 'temple-bell',
    title: '古寺晚钟',
    titleEn: 'Temple Bell at Dusk',
    location: '文殊院 · 黄昏',
    tags: '钟声 · 低鸣 · 冥想',
    desc: '文殊院的晚钟一响,整条街都慢下来。钟声里有金属的嗡鸣,也有成都的静。',
    descEn: 'When the evening bell sounds at Wenshu Monastery, the whole street slows. The ring holds a metallic drone — and the quiet of Chengdu itself.',
    story: '黄昏的文殊院没有游客,只有钟声。一杵下去,金属的泛音要走很久才肯散去,鸟从屋檐上飞起来又落下。成都人的松弛感,有一半是从这种声音里学来的。',
    storyEn: 'At dusk Wenshu Monastery has no tourists — only the bell. One strike, and the metallic overtones take a long, long time to leave; birds rise from the eaves and settle again. Half of Chengdu’s calm, we think, is learned from sounds like this.',
    product: { href: '/shop/panda-egg', label: '我们的第一件作品:熊猫蛋仔(预售中)', labelEn: 'Our first piece: Panda Egg — now in pre-order' },
  },
];

export default function FreeSoundsPage() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<SoundItem | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [dbSounds, setDbSounds] = useState<DbSound[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [audioPlayingId, setAudioPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => onPlayingChange(setPlayingId), []);

  // 拉取后台「声音管理」发布的实录音频
  useEffect(() => {
    fetch('/api/free-sounds?limit=100&page=1')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setDbSounds(data.data);
      })
      .catch((err) => console.error('Failed to load sounds:', err));
  }, []);

  // 合并列表：合成音景置顶，实录音频在后；每页 12 条分页
  const allItems = useMemo<SoundItem[]>(
    () => [
      ...SOUNDSCAPES.map((s) => ({ kind: 'synth' as const, ...s })),
      ...dbSounds.map((s) => ({ kind: 'audio' as const, ...s })),
    ],
    [dbSounds]
  );
  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
  const pageItems = allItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setAudioPlayingId(null);
  }, []);

  const toggleAudio = useCallback((item: Extract<SoundItem, { kind: 'audio' }>) => {
    if (audioPlayingId === item.id) {
      stopAudio();
      return;
    }
    stopScene(); // 合成音景与实录音频互斥
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(item.audio);
    a.loop = true;
    audioRef.current = a;
    a.play().catch(() => setAudioPlayingId(null));
    setAudioPlayingId(item.id);
  }, [audioPlayingId, stopAudio]);

  const toggle = useCallback((id: string) => {
    if (playingId === id) {
      stopScene();
    } else {
      stopAudio();
      playScene(id);
    }
  }, [playingId, stopAudio]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    stopScene();
    stopAudio();
    setCurrentPage(page);
  };

  // 关闭弹层时停止播放
  useEffect(() => {
    if (!selected) {
      stopScene();
      stopAudio();
    }
  }, [selected, stopAudio]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubscribed(true);
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ===== Hero(黑) ===== */}
      <section className="bg-black text-white pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.35em] text-gray-400 mb-6">FREE SOUNDSCAPES · 声音礼物</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-5">
            Free Chengdu Sounds
            <span className="block text-2xl md:text-3xl font-normal text-gray-300 mt-3">成都声音礼物</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-4">
            六段成都氛围音景——盖碗茶馆、雨夜青瓦、望江竹涛、锦水晨鸟、夜市灯火、古寺晚钟。
            助眠、专注,或者单纯想念成都的时候,戴上耳机。
          </p>
          <p className="text-gray-500 text-sm">
            Six ambient Chengdu soundscapes for sleep, focus and nostalgia — teahouse, rain, bamboo, birds, market, temple bell.
          </p>
          <p className="mt-6 inline-block text-[11px] tracking-wider text-gray-500 border border-gray-700 px-3 py-1.5">
            音景由工作室基于城市声音记忆实时合成 · SYNTHESIZED IN-APP · NO ADS · FREE FOREVER
          </p>
        </div>
      </section>

      {/* ===== 音景列表 ===== */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {pageItems.map((item, i) => {
              const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;
              const isSynth = item.kind === 'synth';
              const isPlaying = isSynth
                ? playingId === item.id
                : audioPlayingId === item.id;
              const hasStory =
                item.kind === 'synth' ||
                !!(item.description?.replace(/<[^>]*>/g, '').trim() || item.culturalStory?.replace(/<[^>]*>/g, '').trim());
              return (
                <div
                  key={`${item.kind}-${item.id}`}
                  className={`border p-5 flex items-center gap-5 transition-colors ${
                    isPlaying ? 'border-black bg-[#FAFAFA]' : 'border-[#EEEEEE] hover:border-black/40'
                  }`}
                >
                  <button
                    onClick={() =>
                      isSynth ? toggle(item.id) : toggleAudio(item as Extract<SoundItem, { kind: 'audio' }>)
                    }
                    aria-label={isPlaying ? '暂停' : '播放'}
                    className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isPlaying ? 'bg-black scale-105' : 'bg-black hover:bg-[#B54A32]'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-xs text-gray-400 font-mono">{String(globalIndex + 1).padStart(2, '0')}</span>
                      <h3 className="font-serif font-bold text-lg text-black">{item.title}</h3>
                      {item.titleEn && item.titleEn !== item.title && (
                        <h4 className="text-sm text-gray-500">{item.titleEn}</h4>
                      )}
                      {item.kind === 'audio' && (
                        <span className="text-[10px] tracking-widest text-gray-400 border border-[#EEEEEE] px-2 py-0.5">实录</span>
                      )}
                    </div>
                    {isSynth ? (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {item.location}
                        <span className="text-gray-300">·</span>
                        <span className="truncate">{item.tags}</span>
                      </p>
                    ) : (
                      item.duration && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {item.duration}
                          <span className="text-gray-300">·</span>
                          <span>工作室实地录制</span>
                        </p>
                      )
                    )}
                    {isPlaying && (
                      <div className="flex items-end gap-[3px] h-4 mt-2">
                        {[0, 1, 2, 3, 4].map(b => (
                          <span
                            key={b}
                            className="w-[3px] bg-black animate-[eq_0.9s_ease-in-out_infinite]"
                            style={{ height: `${40 + ((b * 17) % 60)}%`, animationDelay: `${b * 0.12}s` }}
                          />
                        ))}
                        <span className="text-[11px] text-gray-400 ml-2">正在播放 · ∞ 无尽循环</span>
                      </div>
                    )}
                  </div>

                  {hasStory && (
                    <button
                      onClick={() => setSelected(item)}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white border border-black transition-colors flex-shrink-0"
                    >
                      故事
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {allItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">声音整理中，敬请期待。</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 border border-[#EEEEEE] text-sm hover:border-black/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一页</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-black text-white'
                        : 'border border-[#EEEEEE] text-gray-600 hover:border-black/40'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 border border-[#EEEEEE] text-sm hover:border-black/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>下一页</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== 专辑邮箱领取(黑) ===== */}
      <section className="bg-black text-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Volume2 className="w-8 h-8 mx-auto mb-5 stroke-[1.25]" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">
            《成都声音地图》完整专辑 · 即将录制
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            上面六段是工作室合成的氛围小样。我们正在成都街头录制真正的声音专辑——
            茶馆、菜市、蝉鸣与麻将。留下邮箱,专辑上线时第一时间发给你;
            同时你会收到新作投票与预售开启的通知,决定我们下一件做什么。
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-white">
              <Check className="w-5 h-5" />
              <span className="font-medium">已登记。专辑录好那天,我们写信给你。</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/20 px-4 focus-within:border-white">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent py-3 text-white placeholder:text-gray-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-white text-black font-medium hover:bg-[#B54A32] hover:text-white transition-colors disabled:opacity-50"
              >
                {submitting ? '...' : '免费登记'}
              </button>
            </form>
          )}
          <p className="text-xs text-gray-600 mt-4">不发广告,随时退订。</p>
        </div>
      </section>

      {/* ===== 软桥接:去工作室逛逛 ===== */}
      <section className="py-16 bg-[#FAFAFA] border-y border-[#EEEEEE]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-3">FROM EARS TO DESK</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-black mb-4">
            听成都的声音,也把成都的日常带走
          </h2>
          <p className="text-gray-600 mb-8">
            我们把这些声音记忆做成了桌上的小物件——由你投票决定下一件生产什么。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop?tab=design" className="px-8 py-3 bg-black text-white text-sm tracking-widest hover:bg-[#B54A32] transition-colors">
              去投票 · 决定下一件
            </Link>
            <Link href="/shop" className="px-8 py-3 border border-black text-black text-sm tracking-widest hover:bg-black hover:text-white transition-colors">
              看看在售作品
            </Link>
            <Link href="/blog" className="px-8 py-3 text-black text-sm tracking-widest underline underline-offset-4 hover:text-[#B54A32] transition-colors">
              设计故事
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 详情弹层 ===== */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-[#EEEEEE] sticky top-0 bg-white">
              <div>
                <h2 className="font-serif text-2xl font-bold text-black">{selected.title}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selected.titleEn} · {selected.kind === 'synth' ? selected.location : `${selected.duration} · 实录`}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <button
                onClick={() =>
                  selected.kind === 'synth'
                    ? toggle(selected.id)
                    : toggleAudio(selected as Extract<SoundItem, { kind: 'audio' }>)
                }
                className={`w-full py-4 flex items-center justify-center gap-3 text-sm tracking-widest font-medium transition-colors mb-6 ${
                  (selected.kind === 'synth' ? playingId === selected.id : audioPlayingId === selected.id)
                    ? 'bg-[#B54A32] text-white'
                    : 'bg-black text-white hover:bg-[#B54A32]'
                }`}
              >
                {(selected.kind === 'synth' ? playingId === selected.id : audioPlayingId === selected.id)
                  ? <Pause className="w-5 h-5" />
                  : <Play className="w-5 h-5" />}
                {(selected.kind === 'synth' ? playingId === selected.id : audioPlayingId === selected.id)
                  ? '暂停播放'
                  : selected.kind === 'synth' ? '播放这段音景' : '播放这段录音'}
                <span className="text-xs opacity-70">∞ 循环</span>
              </button>

              <div className="space-y-5">
                {selected.kind === 'synth' ? (
                  <>
                    <p className="text-gray-800 leading-relaxed">{selected.desc}</p>
                    <p className="text-gray-500 text-sm leading-relaxed italic">{selected.descEn}</p>
                  </>
                ) : (
                  selected.description?.replace(/<[^>]*>/g, '').trim() && (
                    <div
                      className="text-gray-800 leading-relaxed [&_p]:mt-2"
                      dangerouslySetInnerHTML={{ __html: selected.description }}
                    />
                  )
                )}

                <div className="border-t border-dashed border-[#DDDDDD]" />

                {selected.kind === 'synth' ? (
                  <div>
                    <p className="text-xs tracking-[0.25em] text-gray-400 mb-2">声音小记</p>
                    <p className="text-gray-700 leading-relaxed">{selected.story}</p>
                    <p className="text-gray-500 text-sm leading-relaxed mt-3">{selected.storyEn}</p>
                  </div>
                ) : (
                  selected.culturalStory?.replace(/<[^>]*>/g, '').trim() && (
                    <div>
                      <p className="text-xs tracking-[0.25em] text-gray-400 mb-2">声音小记</p>
                      <div
                        className="text-gray-700 leading-relaxed [&_p]:mt-2"
                        dangerouslySetInnerHTML={{ __html: selected.culturalStory }}
                      />
                    </div>
                  )
                )}

                {selected.kind === 'synth' && (
                  <Link
                    href={selected.product.href}
                    onClick={() => stopScene()}
                    className="block border border-black p-4 hover:bg-black hover:text-white transition-colors group"
                  >
                    <p className="text-sm font-medium">🎁 {selected.product.label}</p>
                    <p className="text-xs opacity-60 mt-1 group-hover:opacity-80">{selected.product.labelEn}</p>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        @keyframes eq {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
