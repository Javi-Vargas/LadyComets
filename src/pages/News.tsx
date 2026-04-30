import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import { supabase, getContentImageUrl, type DbContentItem } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/* Maps DB type slug → readable category label */
const TYPE_LABELS: Record<string, string> = {
  feature: 'Feature',
  culture: 'Culture',
  game_recap: 'Game Recap',
  training: 'Training',
  merch: 'Merch',
  player_spotlight: 'Player Spotlight',
  general: 'News',
}

interface ArticleItem {
  id: number
  featured: boolean
  wide: boolean
  image: string | null
  category: string
  title: string
  excerpt: string | null
  date: string | null
  readTime: string | null
  instagram_url: string | null
}

function toArticleItem(item: DbContentItem): ArticleItem {
  return {
    id: item.id,
    featured: item.featured,
    wide: item.wide,
    image: getContentImageUrl(item),
    category: TYPE_LABELS[item.type] ?? item.type,
    title: item.title,
    excerpt: item.excerpt,
    date: item.date,
    readTime: item.read_time,
    instagram_url: item.instagram_url,
  }
}

export default function News() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      const { data } = await supabase
        .from('content_items')
        .select('*')
        .eq('section', 'news')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      setArticles(((data ?? []) as DbContentItem[]).map(toArticleItem))
      setLoading(false)
    }
    void loadArticles()
  }, [])

  const featured = articles.find((a) => a.featured)
  const rest = articles.filter((a) => !a.featured)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12" data-testid="news-page">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Latest</p>
        <h1 className="text-4xl font-black uppercase text-white mt-1">News</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Featured article */}
          {featured && (
            <Link href={`/news/${featured.id}`}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden cursor-pointer group mb-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              data-testid="news-featured"
            >
              <div className="relative h-[420px] md:h-[520px] overflow-hidden">
                {featured.image && (
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                <span className="text-xs font-black uppercase tracking-widest text-primary mb-2 inline-block">
                  {featured.category}
                </span>
                <h2 className="text-2xl md:text-4xl font-black uppercase text-white leading-tight mb-3 max-w-3xl">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-sm md:text-base max-w-2xl mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-white/40 flex-wrap">
                  {featured.date && <span>{featured.date}</span>}
                  {featured.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featured.readTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-primary font-bold group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                  {featured.instagram_url && (
                    <a
                      href={featured.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-pink-400/60 hover:text-pink-400 font-bold transition-colors"
                    >
                      View on Instagram ↗
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
            </Link>
          )}

          {/* Rest of articles */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((article, i) => (
                <Link key={article.id} href={`/news/${article.id}`}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className={cn(
                    'relative overflow-hidden cursor-pointer group border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]',
                    article.wide && 'md:col-span-2',
                  )}
                  data-testid={`news-article-${article.id}`}
                >
                  {article.image && (
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 inline-block">
                      {article.category}
                    </span>
                    <h3 className="text-lg font-black uppercase text-white leading-tight mb-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-white/50 line-clamp-2 mb-4">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
                      {article.date && <span>{article.date}</span>}
                      {article.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                      )}
                      {article.instagram_url && (
                        <a
                          href={article.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-pink-400/40 hover:text-pink-400 font-bold transition-colors"
                        >
                          IG ↗
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
                </Link>
              ))}
            </div>
          )}

          {articles.length === 0 && (
            <div className="text-center py-24">
              <p className="text-white/30 text-sm">No news articles yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
