import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsArticle } from './entities/news-article.entity';
import { Match } from './entities/match.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(NewsArticle) private readonly news: Repository<NewsArticle>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
  ) {}

  listNews() {
    return this.news.find({
      where: { isPublished: true },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  listMatches() {
    return this.matches.find({
      where: { isPublished: true },
      order: { matchDate: 'DESC' },
    });
  }

  createNews(dto: CreateNewsDto) {
    return this.news.save(this.news.create({
      slug: dto.slug,
      title: dto.title,
      summary: dto.summary ?? null,
      content: dto.content,
      coverImageKey: null,
      publishedAt: dto.isPublished ? new Date() : null,
      isPublished: dto.isPublished ?? false,
    }));
  }

  createMatch(dto: CreateMatchDto) {
    return this.matches.save(this.matches.create({
      title: dto.title,
      opponent: dto.opponent,
      matchDate: new Date(dto.matchDate),
      venue: dto.venue,
      result: dto.result ?? null,
      score: dto.score ?? null,
      isPublished: dto.isPublished ?? false,
    }));
  }
}
