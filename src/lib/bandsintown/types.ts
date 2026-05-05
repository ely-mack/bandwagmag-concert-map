export interface BandsintownEvent {
  id: string;
  url: string;
  datetime: string;
  title: string;
  description: string;
  artist: {
    id: number;
    name: string;
    url: string;
    image_url: string;
    thumb_url: string;
    tracker_count: number;
  };
  venue: {
    name: string;
    latitude: string;
    longitude: string;
    city: string;
    region: string;
    country: string;
  };
  offers: {
    type: string;
    url: string;
    status: string;
  }[];
  lineup: string[];
  on_sale_datetime: string;
}
