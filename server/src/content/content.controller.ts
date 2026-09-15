import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { DbService, type EventRow } from "../db/db.service";
import { AuthGuard } from "../auth/auth.guard";

class SavePostDto {
  slug!: string;
  title!: string;
  date!: string;
  category!: string;
  excerpt!: string;
  author?: string;
  body!: string[];
}

class SaveEventDto {
  id!: string;
  title!: string;
  date!: string;
  location?: string;
  description!: string;
  status?: string;
  cta?: string | null;
  ctaHref?: string | null;
}

@Controller("api")
export class ContentController {
  constructor(private db: DbService) {}

  /* --------------------------------- posts --------------------------------- */

  @Get("posts")
  listPosts() {
    return this.db.listPosts().map((p) => ({ ...p, body: JSON.parse(p.body) as string[] }));
  }

  @Get("posts/:slug")
  getPost(@Param("slug") slug: string) {
    const post = this.db.getPost(slug);
    return post ? { ...post, body: JSON.parse(post.body) as string[] } : null;
  }

  @UseGuards(AuthGuard)
  @Put("posts/:slug")
  savePost(@Param("slug") slug: string, @Body() dto: SavePostDto) {
    const targetSlug = slug && slug !== "_" ? slug : dto.slug;
    this.db.upsertPost({ ...dto, slug: targetSlug, author: dto.author ?? "HPTF Team" });
    return { ok: true, slug: targetSlug };
  }

  @UseGuards(AuthGuard)
  @Delete("posts/:slug")
  deletePost(@Param("slug") slug: string) {
    return { ok: this.db.deletePost(slug) };
  }

  /* --------------------------------- events -------------------------------- */

  @Get("events")
  listEvents() {
    return this.db.listEvents();
  }

  @UseGuards(AuthGuard)
  @Put("events/:id")
  saveEvent(@Param("id") eventId: string, @Body() dto: SaveEventDto) {
    const dateObj = new Date(`${dto.date}T00:00:00`);
    const event: EventRow = {
      id: eventId && eventId !== "_" ? eventId : dto.id,
      title: dto.title,
      date: dto.date,
      date_label: isNaN(dateObj.getTime())
        ? dto.date
        : dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      location: dto.location ?? "Kaduna, Nigeria",
      description: dto.description,
      cta: dto.cta ?? null,
      cta_href: dto.ctaHref ?? null,
      status: dto.status ?? "upcoming",
    };
    this.db.upsertEvent(event);
    return { ok: true, id: event.id };
  }

  @UseGuards(AuthGuard)
  @Delete("events/:id")
  deleteEvent(@Param("id") id: string) {
    return { ok: this.db.deleteEvent(id) };
  }
}
