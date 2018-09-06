import moment from "moment";

export function formatDate(dateString) {
    return moment(dateString).format('MMMM YYYY');
}
  
export function formatDateTime(dateTimeString) {
  return moment(dateTimeString).format('MMMM Do YYYY, HH:mm');
}  