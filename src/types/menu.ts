import { type ElementType } from "react";

export interface SubMenuItem {
  to: string;
  label: string;
  icon: ElementType;
  disabled?: boolean;
  badge?: string;
}

export interface MenuItem {
  to?: string;
  label: string;
  icon: ElementType;
  subItems?: SubMenuItem[];
}