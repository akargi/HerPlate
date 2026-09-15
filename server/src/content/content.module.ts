import { Module } from "@nestjs/common";
import { ContentController } from "./content.controller";
import { AuthGuard } from "../auth/auth.guard";
import { DbModule } from "../db/db.module";

@Module({
  imports: [DbModule],
  controllers: [ContentController],
  providers: [AuthGuard],
})
export class ContentModule {}
