// Preloaded into TypeScript snippet runs. Node's fetch waits at most 300 s
// for response headers, and image generation can take longer.
import { Agent, setGlobalDispatcher } from 'undici';

setGlobalDispatcher(new Agent({ headersTimeout: 900000, bodyTimeout: 900000 }));
