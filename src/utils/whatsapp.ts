export const WHATSAPP_NUMBER = '263714701721';
export const WHATSAPP_DISPLAY_NUMBER = '+263 714 701 721';

/**
 * Generates a pre-filled WhatsApp enquiry URL for a specific experience.
 * Message format required:
 * Hello Outbound Holidays,
 * 
 * I'm interested in [Experience Name] and would like to know its availability, pricing and how to book.
 * 
 * Thank you.
 */
export function getWhatsAppEnquiryUrl(
  experienceName: string, 
  options?: { date?: string; guests?: number | string; experienceUrl?: string; additionalNotes?: string }
): string {
  let message = `Hello Outbound Holidays,\n\nI'm interested in ${experienceName} and would like to know its availability, pricing and how to book.`;

  const details: string[] = [];
  if (options?.date) details.push(`Preferred Date: ${options.date}`);
  if (options?.guests) details.push(`Guests/Group Size: ${options.guests}`);
  if (options?.additionalNotes) details.push(`Notes: ${options.additionalNotes}`);

  if (details.length > 0) {
    message += `\n\n[Details: ${details.join(' | ')}]`;
  }

  if (options?.experienceUrl) {
    message += `\n\nPage Link: ${options.experienceUrl}`;
  }

  message += `\n\nThank you.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a WhatsApp URL for general planning or speaking with a travel specialist.
 */
export function getWhatsAppSpecialistUrl(topic?: string): string {
  const message = topic
    ? `Hello Outbound Holidays,\n\nI need some help planning my Victoria Falls trip regarding ${topic}. Could I speak with a Victoria Falls travel specialist?\n\nThank you.`
    : `Hello Outbound Holidays,\n\nI need some help choosing the right experiences for my Victoria Falls trip. Could I speak with a Victoria Falls travel specialist?\n\nThank you.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
