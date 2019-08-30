import { getTickets } from "../lib/success";
import { pluginConfig, context } from "./fakedata";
import { PluginConfig } from "../lib/types";

describe('Success tests', () => {
  describe('#getTickets', () => {
    it('should analyze tickets with one ticketPrefix', () => {
      const config = {
        ...pluginConfig,
        ticketPrefixes: ['UH']
      } as PluginConfig;
      expect(getTickets(config, context)).toEqual(['UH-1258'])
    })

    it('should get multiple tickets on the same commit', () => {
      const config = {
        ...pluginConfig,
        ticketPrefixes: ['TEST']
      } as PluginConfig;
      expect(getTickets(config, context)).toEqual(['TEST-123', 'TEST-234'])
    })

    it('should analyze tickets with many ticketPrefix', () => {
      const config = {
        ...pluginConfig,
        ticketPrefixes: ['UH', 'FIX']
      } as PluginConfig
      expect(getTickets(config, context)).toEqual(['FIX-321', 'UH-1258', 'FIX-123'])
    })

    it('should analyze tickets with ticketRegex', () => {
      const ticketRegex = '[A-Za-z]+-\\d+';

      const config: PluginConfig = {
        ...pluginConfig,
        ticketRegex
      } as PluginConfig;

      expect(getTickets(config, context)).toEqual(['FIX-321', 'UH-1258', 'FIX-123', 'TEST-123', 'TEST-234'])
    })
  })
})

