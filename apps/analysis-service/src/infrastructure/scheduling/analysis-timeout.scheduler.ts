import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExpireStaleAnalysesUseCase } from "../../application/expire-stale-analyses.use-case.js";

/** Periodically runs ExpireStaleAnalysesUseCase. */
@Injectable()
export class AnalysisTimeoutScheduler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(AnalysisTimeoutScheduler.name);
  private timer?: NodeJS.Timeout;
  private inFlight?: Promise<unknown>;
  private timeoutMs = 0;

  constructor(
    private readonly expireStaleAnalyses: ExpireStaleAnalysesUseCase,
    private readonly configService: ConfigService,
  ) {}

  onApplicationBootstrap() {
    this.timeoutMs = Number(this.configService.get("ANALYSIS_TIMEOUT_MS", 10 * 60_000));
    const checkIntervalMs = Number(
      this.configService.get("ANALYSIS_TIMEOUT_CHECK_INTERVAL_MS", 60_000),
    );
    this.timer = setInterval(() => this.tick(), checkIntervalMs);
  }

  async onModuleDestroy() {
    clearInterval(this.timer);
    await this.inFlight;
  }

  private tick() {
    if (this.inFlight) return;

    this.inFlight = this.expireStaleAnalyses
      .execute({ createdBefore: new Date(Date.now() - this.timeoutMs) })
      .catch((error: unknown) => this.logger.error("Analysis timeout run failed", error))
      .finally(() => {
        this.inFlight = undefined;
      });
  }
}
