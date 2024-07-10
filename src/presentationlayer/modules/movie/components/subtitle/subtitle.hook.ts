import { useEffect, useState } from 'react';
import { APIS } from '../../../../../infrastructure/state/config';
import { Movie } from '../../../../../domain/movie/movies/Movie';

interface SubtitleHookProps {
  readonly movie?: Movie | null | undefined;
}
export function useSubtitleHook({ movie }: SubtitleHookProps): { subtitle: string | undefined } {
  const [subtitle, setSubtitle] = useState<string>();
  const srtToVTT = (movie: Movie) => {
    const subtitle = {
      data: {
        movie: movie,
        src: '',
      },
      /**
       * Load the file from url
       *
       * @param src
       */
      load: function (movie: Movie) {
        subtitle.data.movie = movie;

        subtitle.data.src = APIS.API_URL + movie.subtitleLink;

        if (subtitle.isSrt(APIS.API_URL + movie.subtitleLink)) {
          subtitle.data.src = APIS.API_URL + movie.subtitleLink;
        } else if (movie.embededSubtitles.length > 0) {
          console.log(movie.embededSubtitles);
          if (movie.embededSubtitles.find((sub) => sub.language === 'rum')) {
            subtitle.data.src = APIS.API_URL + '/api/v1/subtitle?movie=' + movie.movieLink + '&language=rum';
          } else if (movie.embededSubtitles.find((sub) => sub.language === 'eng')) {
            subtitle.data.src = APIS.API_URL + '/api/v1/subtitle?movie=' + movie.movieLink + '&language=eng';
          }
        }

        const client = new XMLHttpRequest();
        client.open('GET', subtitle.data.src);
        client.onreadystatechange = function () {
          console.log(subtitle.data.src);
          subtitle.convert(client.responseText).then(function (file) {
            subtitle.data.src = file;
            setSubtitle(subtitle.data.src);
          });
        };
        client.send();
      },
      /**
       * Converts the SRT string to a VTT formatted string
       *
       * @param   {string}    content     - SRT string
       * @return  {object}    promise     - Returns a promise with the generated file as the return value
       */
      convert: function (content: string): Promise<string> {
        return new Promise(function (resolve, reject) {
          /**
           * Replace all (,) commas with (.) dots. Eg: 00:00:01,144 -> 00:00:01.144
           */
          content = content.replace(/(\d+:\d+:\d+)+,(\d+)/g, '$1.$2');
          content = 'WEBVTT - Generated using SRT2VTT\r\n\r\n' + content;

          /**
           * Convert content to a file
           */
          const blob = new Blob([content], { type: 'text/vtt' });
          const file = window.URL.createObjectURL(blob);

          resolve(file);
        });
      },
      isSrt: function (filename: string): boolean {
        return filename.split('.').pop()?.toLowerCase() === 'srt';
      },
      isVTT: function (filename: string) {
        return filename.split('.').pop()?.toLowerCase() === 'vtt';
      },
    };

    subtitle.load(movie);
  };

  useEffect(() => {
    if (!movie) {
      console.log('no source');
      return;
    }

    srtToVTT(movie);
  }, [movie]);

  return { subtitle };
}
