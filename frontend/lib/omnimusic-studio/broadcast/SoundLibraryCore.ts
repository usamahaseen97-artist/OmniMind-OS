import type { SoundCollection, SoundLibraryItem } from "../broadcast-types";
import { SOUND_LIBRARY_SEED } from "./constants";

export class SoundLibraryCore {
  items: SoundLibraryItem[] = [...SOUND_LIBRARY_SEED];
  collections: SoundCollection[] = [
    { id: "col-podcast", name: "Podcast Essentials", itemIds: ["sl-1"] },
    { id: "col-broadcast", name: "Broadcast Beds", itemIds: ["sl-2"] },
  ];

  list(category?: SoundLibraryItem["category"]) {
    return category ? this.items.filter((i) => i.category === category) : this.items;
  }

  search(query: string) {
    const q = query.toLowerCase();
    return this.items.filter((i) => i.name.toLowerCase().includes(q) || i.tags.some((t) => t.includes(q)));
  }

  toggleFavorite(id: string) {
    const item = this.items.find((i) => i.id === id);
    if (item) item.favorite = !item.favorite;
    return item ?? null;
  }

  favorites() {
    return this.items.filter((i) => i.favorite);
  }

  listCollections() {
    return this.collections;
  }
}

export const soundLibraryCore = new SoundLibraryCore();
