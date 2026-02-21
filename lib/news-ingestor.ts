import { XMLParser } from 'fast-xml-parser';

export interface NewsArticle {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

/**
 * Récupère les actualités mode/contexte via Google News RSS (Gratuit)
 */
export async function fetchFashionNews(query = 'fashion trends 2026 events'): Promise<NewsArticle[]> {
    try {
        const response = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`);
        const xmlData = await response.text();

        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        const items = jsonObj.rss?.channel?.item || [];
        const articles = (Array.isArray(items) ? items : [items]).map((item: any) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: item.source?.['#text'] || item.source || 'Unknown'
        }));

        return articles.slice(0, 15); // On prend les 15 plus récents
    } catch (error) {
        console.error('[News Ingestor] Error fetching Google News:', error);
        return [];
    }
}
