import moment from "moment";

export function formatDate(dateString) {
    return moment(dateString).format('MMMM YYYY');
}
  
export function formatDateTime(dateTimeString) {
  return moment(dateTimeString).format('MMMM Do YYYY, HH:mm');
}

export function formatDateTimeShort(dateTimeString) {
    return moment(dateTimeString).format('DD-MM-YYYY HH:mm');
}

export function getIsoStringFromDateAndTime(givenDate ,hour, minute) {
    const date = moment(givenDate);
    date.set({ hours: hour, minutes: minute });
    return date.toISOString();
}

export function getIsoStringFromDate(givenDate) {
    const date = moment(givenDate);
    console.log(date);
    console.log(date.toISOString());
    return date.toISOString();
}