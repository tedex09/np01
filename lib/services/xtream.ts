import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

interface XtreamCredentials {
  username: string;
  password: string;
}

export class XtreamService {
  private baseUrl: string;
  private credentials: XtreamCredentials;

  constructor(baseUrl: string, credentials: XtreamCredentials) {
    this.baseUrl = baseUrl;
    this.credentials = credentials;
  }

  private getCacheKey(endpoint: string): string {
    return `${this.credentials.username}:${endpoint}`;
  }

  private async makeRequest(endpoint: string) {
    const cacheKey = this.getCacheKey(endpoint);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const url = `${this.baseUrl}/player_api.php`;
    const params = {
      username: this.credentials.username,
      password: this.credentials.password,
      action: endpoint
    };

    try {
      const response = await axios.get(url, { params });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async getLiveStreams() {
    return this.makeRequest('get_live_streams');
  }

  async getVodStreams() {
    return this.makeRequest('get_vod_streams');
  }

  async getSeriesStreams() {
    return this.makeRequest('get_series');
  }

  async getStreamUrl(streamId: string, streamType: 'live' | 'movie' | 'series'): string {
    const type = streamType === 'live' ? 'live' : streamType === 'movie' ? 'movie' : 'series';
    return `${this.baseUrl}/${type}/${this.credentials.username}/${this.credentials.password}/${streamId}.m3u8`;
  }
}