import { useState, useEffect } from 'react'
import { Link, useParams } from 'wouter'
import { motion } from 'framer-motion'
import { Clock, ArrowLeft } from 'lucide-react'
import { supabase, getContentImageUrl, type DbContentItem } from '@/lib/supabase'

const TYPE_LABELS: Record<string, string> = {
  feature: 'Feature',
  culture: 'Culture',
  game_recap: 'Game Recap',
  training: 'Training',
  merch: 'Merch',
  player_spotlight: 'Player Spotlight',
  general: 'News',
}

export default function NewsArticle() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<DbContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('content_items')
      .select('*')
      .eq('id', id)
      .eq('section', 'news')
      .eq('published', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setArticle(data as DbContentItem)
        }
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-white/30 text-sm mb-4">Article not found.</p>
        <Link href="/news" className="text-primary text-sm font-bold hover:underline">
          ← Back to News
        </Link>
      </div>
    )
  }

  const image = getContentImageUrl(article)
  const category = TYPE_LABELS[article.type] ?? article.type

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors duration-200 mb-8"
      >
        <ArrowLeft className="w-3 h-3" />
        All News
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-xs font-black uppercase tracking-widest text-primary mb-3 inline-block">
          {category}
        </span>

        <h1 className="text-3xl md:text-5xl font-black uppercase text-white leading-tight mb-4">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-white/30 mb-8 flex-wrap">
          {article.date && <span>{article.date}</span>}
          {article.read_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.read_time}
            </span>
          )}
        </div>

        {image && (
          <div className="relative w-full h-[300px] md:h-[460px] overflow-hidden mb-8">
            <img
              src={image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        )}

        {article.excerpt && (
          <div className="glass-panel p-6 md:p-8 mb-6">
            <p className="text-base md:text-lg text-white/70 leading-relaxed">
              {article.excerpt}
            </p>
          </div>
        )}

        {article.instagram_url && (
          <div className="mt-4">
            <a
              href={article.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-pink-400 hover:text-pink-300 transition-colors"
            >
              View original post on Instagram ↗
            </a>
          </div>
        )}
      </motion.article>

      <div className="mt-12 pt-8 border-t border-white/10">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to News
        </Link>
      </div>
    </div>
  )
}
