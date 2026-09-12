import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { FileStoragePort } from "../../application/ports/file-storage.port.js";

const BUCKET_NAME = "documents";

@Injectable()
export class SupabaseStorageService implements FileStoragePort {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async upload(params: {
    path: string;
    file: Buffer;
    contentType: string;
  }): Promise<void> {
    const { error } = await this.client.storage
      .from(BUCKET_NAME)
      .upload(params.path, params.file, {
        contentType: params.contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file to Supabase Storage: ${error.message}`);
    }
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await this.client.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }

    return data.signedUrl;
  }

  async getSignedUrls(
    paths: string[],
    expiresInSeconds = 3600,
  ): Promise<Record<string, string>> {
    const { data, error } = await this.client.storage
      .from(BUCKET_NAME)
      .createSignedUrls(paths, expiresInSeconds);

    if (error || !data) {
      throw new Error(`Failed to generate signed URLs: ${error?.message}`);
    }

    const result: Record<string, string> = {};
    data.forEach((item, index) => {
      if (item.signedUrl) {
        result[paths[index]] = item.signedUrl;
      }
    });
    return result;
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file from Supabase Storage: ${error.message}`);
    }
  }
}