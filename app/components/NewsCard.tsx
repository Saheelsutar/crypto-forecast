'use client';

import { Article } from '../services/newsApi';

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const {
    title,
    description,
    url,
    source,
    publishedAt
  } = article;

  // Format the date
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'No date available';
      
      // Check if the date is valid
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{source || 'News Source'}</span>
          <span>{formatDate(publishedAt)}</span>
        </div>
      </a>
    </div>
  );
} 