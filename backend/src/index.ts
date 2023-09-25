/**
 * SecureGate - Backend & Bot Client
 * 2023 Vientorepublic
 */

import 'dotenv/config';
import { Server } from './web';
import { normalizePort } from './web/modules';
import consola from 'consola';

let isDev: boolean;
if (process.env.NODE_ENV === 'production') isDev = false;
else if (process.env.NODE_ENV === 'development') isDev = true;
else isDev = false;

const port = normalizePort(process.env.PORT);

consola.info(`isDev: ${isDev}`);
new Server(port, isDev).start();