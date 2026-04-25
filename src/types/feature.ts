export interface Feature {
  id?: string;
  title: string;
  desc: string;
  link?: string;
  src?: string;
  icon?: React.ReactNode;

  // extended fields (used in modal)
  fullDesc?: string;
  fullImage?: string;
}
