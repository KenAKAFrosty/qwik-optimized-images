import { type QwikIntrinsicElements, component$ } from "@builder.io/qwik";
import { type ImagePath } from "./image-paths";

type ImageSrc =
  | ImagePath
  | `http${string}`
  | `data:${string}`
  | `blob:${string}`
  | `file:${string}`

type BaseAttributes = Omit<QwikIntrinsicElements["img"], "src">;

type ImageProps = { src: ImageSrc } & BaseAttributes;

export const Image = component$((props: ImageProps) => {
  const { src, ...imgProps } = props;
  return <img {...imgProps} src={src as string}></img>;
});
