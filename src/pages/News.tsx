import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import { articles } from '@/data/news'
import { cn } from '@/lib/utils'

export default function News() {
  const featured = articles.find((a) => a.featured)
  const rest = articles.filter((a) => !a.featured)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12" data-testid="news-page">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Latest</p>
        <h1 className="text-4xl font-black uppercase text-white mt-1">News</h1>
      </div>

      {/* Featured article */}
      {featured && (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden cursor-pointer group mb-4"
          data-testid="news-featured"
        >
          <div className="relative h-[420px] md:h-[520px] overflow-hidden">
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
            />
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
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>{featured.date}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {featured.readTime}
              </span>
              <span className="flex items-center gap-1 text-primary font-bold group-hover:gap-2 transition-all">
                Read More <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </motion.article>
      )}

      {/* Rest of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rest.map((article, i) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={cn(
              'relative overflow-hidden cursor-pointer group border border-white/10 hover:border-white/20 transition-colors',
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
              <p className="text-sm text-white/50 line-clamp-2 mb-4">{article.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span>{article.date}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
