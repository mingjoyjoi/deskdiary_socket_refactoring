import { LocalDateTime } from '@js-joda/core';

export function getFormattedCurrentTime() {
  const localDateTime = LocalDateTime.now().plusHours(9);
  const period = localDateTime.hour() < 12 ? 'AM' : 'PM';
  const formattedHour = localDateTime.hour() % 12 || 12;
  const minute = localDateTime.minute().toString().padStart(2, '0');
  return `${formattedHour}:${minute} ${period}`;
}
