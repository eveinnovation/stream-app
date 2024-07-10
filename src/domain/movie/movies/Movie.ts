export type EmbededSubtitleLanguage = {
  readonly language: string;
};

export interface Movie {
  readonly id: string;
  readonly title: string;
  readonly movieLink: string;
  readonly subtitleLink: string;
  readonly embededSubtitles: EmbededSubtitleLanguage[];
  readonly posterLink: string;
}
