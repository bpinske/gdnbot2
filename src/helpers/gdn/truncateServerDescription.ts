/**
 * Cap server descriptions to 130 characters
 */
export default function truncateServerDescription (desc: string): string {
  return desc.substr(0, 130);
}
