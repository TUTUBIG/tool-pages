import { DEFAULT_LOCALE } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default function RootRedirectPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
