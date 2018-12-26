import { Models } from "./Models";

export interface BaseModel {
    prototype?: any;
    associates?(models: Models): void;
}