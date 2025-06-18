
import { Advertisement } from "@/types/music";

export const advertisements: Advertisement[] = [
  {
    id: "ad1",
    title: "TechGear Pro Headphones",
    brand: "TechGear",
    duration: 30,
    magnitude: 50, // 50 plays per 24 hours
    audioUrl: "https://example.com/ad1.mp3"
  },
  {
    id: "ad2",
    title: "StreamPlus Premium",
    brand: "StreamPlus",
    duration: 25,
    magnitude: 75, // 75 plays per 24 hours
    audioUrl: "https://example.com/ad2.mp3"
  },
  {
    id: "ad3",
    title: "FreshBrew Coffee",
    brand: "FreshBrew",
    duration: 20,
    magnitude: 30, // 30 plays per 24 hours
    audioUrl: "https://example.com/ad3.mp3"
  },
  {
    id: "ad4",
    title: "SportMax Energy Drink",
    brand: "SportMax",
    duration: 35,
    magnitude: 60, // 60 plays per 24 hours
    audioUrl: "https://example.com/ad4.mp3"
  },
  {
    id: "ad5",
    title: "CloudSync Storage",
    brand: "CloudSync",
    duration: 28,
    magnitude: 40, // 40 plays per 24 hours
    audioUrl: "https://example.com/ad5.mp3"
  }
];
