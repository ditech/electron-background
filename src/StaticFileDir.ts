import { protocol } from 'electron';
import {
  dirname, basename, normalize, join,
} from 'path';
import { InitContext, InitPlugin } from './init';

export class StaticFileDir implements InitPlugin {
  constructor(private readonly scheme: string, private readonly dir: string) { }

  public async afterReady(context: InitContext): Promise<void> {
    createFileProtocol(this.scheme, this.dir);
  }
}

/**
 * Wrapper around `protocol.registerFileProtocol` that serves files from the given source directory.
 * The handler will convert any url with the custom scheme to a file path in the source directory in
 * order to find the file to serve. For example, with "media" passed in for scheme and `/public` passed
 * in for sourceDirectory "media://videos/demo.mp4" would resolve to "/public/media/videos/demo.mp4".
 *
 * @param scheme - The scheme to register.
 * @param sourceDirectory - The directory where files are served from.
 */
export function createFileProtocol(scheme: string, sourceDirectory: string): void {
  protocol.registerFileProtocol(scheme, (request, respond) => {
    const requestPath = decodeURI(request.url.replace(`${scheme}://`, ''));
    const requestDir = dirname(requestPath);
    const requestFile = basename(requestPath);
    const path = normalize(join(sourceDirectory, requestDir, requestFile));
    respond({ path });
  });
}
