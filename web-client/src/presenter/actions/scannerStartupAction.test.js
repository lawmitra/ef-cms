import { JSDOM } from 'jsdom';
import { presenter } from '../presenter';
import { runAction } from 'cerebral/test';
import { scannerStartupAction } from './scannerStartupAction';
import path from 'path';

const jsdom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body></body></html>',
);
global.document = jsdom.window.document;
global.window = jsdom.window;

const scannerResourcePath = path.join(
  __dirname,
  '../../../../shared/test-assets',
);
presenter.providers.applicationContext = {
  getScanner: () => ({
    loadDynamsoft: () => 'dynam-scanner-injection',
  }),
  getScannerResourceUri: () => scannerResourcePath,
};

describe('scannerStartupAction', () => {
  it('injects scripts into the dom', async () => {
    const result = await runAction(scannerStartupAction, {
      modules: {
        presenter,
      },
      state: {
        scanner: {},
      },
    });

    const { dynamScriptClass } = result.state.scanner;

    expect(dynamScriptClass).toEqual('dynam-scanner-injection');
  });
});
