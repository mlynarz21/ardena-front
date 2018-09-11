import { API_BASE_URL, POLL_LIST_SIZE, ACCESS_TOKEN } from '../constants';

const request = (options) => {
    const headers = new Headers({
        'Content-Type': 'application/json',
    })
    
    if(localStorage.getItem(ACCESS_TOKEN)) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
    }

    const defaults = {headers: headers};
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
    .then(response => 
        response.json().then(json => {
            if(!response.ok) {
                return Promise.reject(json);
            }
            return json;
        })
    );
};

export function getAllHorses() {

    return request({
        url: API_BASE_URL + "/horses",
        method: 'GET'
    });
}

export function getAllLessons() {

    return request({
        url: API_BASE_URL + "/lessons",
        method: 'GET'
    });
}

export function getAllComingLessons() {

    return request({
        url: API_BASE_URL + "/lessons/coming",
        method: 'GET'
    });
}

export function addReservation(lessonId) {
    return request({
        url: API_BASE_URL + "/reservations/lesson/" + lessonId,
        method: 'POST'
    });
}

export function getUserReservations() {

    return request({
        url: API_BASE_URL + "/reservations/user",
        method: 'GET'
    });
}

export function getUserReservationHistory() {

    return request({
        url: API_BASE_URL + "/reservations/user/history",
        method: 'GET'
    });
}

export function getInstructors() {

    return request({
        url: API_BASE_URL + "/users/instructors",
        method: 'GET'
    });
}

export function getAllUsers() {

    return request({
        url: API_BASE_URL + "/users",
        method: 'GET'
    });
}

export function getAdmins() {

    return request({
        url: API_BASE_URL + "/users/admins",
        method: 'GET'
    });
}

export function getLessonsByDate(lessonData) {

    return request({
        url: API_BASE_URL + "/lessons/date",
        method: 'POST',
        body: JSON.stringify(lessonData)
    });
}

export function addUserRole(username,roleData) {

    return request({
        url: API_BASE_URL + "/users/role/add/"+username,
        method: 'PATCH',
        body: JSON.stringify(roleData)
    });
}

export function removeUserRole(userId,roleData) {

    return request({
        url: API_BASE_URL + "/users/role/remove/"+userId,
        method: 'PATCH',
        body: JSON.stringify(roleData)
    });
}

export function getLessonsByInstructor() {

    return request({
        url: API_BASE_URL + "/lessons/instructor",
        method: 'GET'
    });
}

export function getLessonsByDateAndUser(lessonData) {

    return request({
        url: API_BASE_URL + "/lessons/userDate",
        method: 'POST',
        body: JSON.stringify(lessonData)
    });
}

export function getPendingReservationsByInstructor() {

    return request({
        url: API_BASE_URL + "/reservations/instructor",
        method: 'GET',
    });
}

export function getUnpaidReservationsByInstructor() {

    return request({
        url: API_BASE_URL + "/reservations/instructor/unpaid",
        method: 'GET',
    });
}

export function getUnpaidReservationsByUser() {

    return request({
        url: API_BASE_URL + "/reservations/user/unpaid",
        method: 'GET',
    });
}


export function getLessonsByDateAndInstructor(lessonData) {

    return request({
        url: API_BASE_URL + "/lessons/instructorDate",
        method: 'POST',
        body: JSON.stringify(lessonData)
    });
}

export function getPass(username) {

    return request({
        url: API_BASE_URL + "/passes/"+username,
        method: 'GET',
    });
}

export function addHorse(horseData) {
    return request({
        url: API_BASE_URL + "/horses",
        method: 'POST',
        body: JSON.stringify(horseData)
    });
}

export function addLesson(lessonData) {
    return request({
        url: API_BASE_URL + "/lessons",
        method: 'POST',
        body: JSON.stringify(lessonData)
    });
}

export function deleteHorse(horseId) {
    return request({
        url: API_BASE_URL + "/horses/" + horseId,
        method: 'DELETE',
    });
}

export function updateHorse(horseId, horseData) {
    return request({
        url: API_BASE_URL + "/horses/" + horseId,
        method: 'PATCH',
        body: JSON.stringify(horseData)
    });
}

export function deleteLesson(lessonId) {
    return request({
        url: API_BASE_URL + "/lessons/" + lessonId,
        method: 'DELETE',
    });
}

export function cancelReservation(reservationId) {
    return request({
        url: API_BASE_URL + "/reservations/cancel/" + reservationId,
        method: 'PATCH',
    });
}

export function acceptReservation(reservationId) {
    return request({
        url: API_BASE_URL + "/reservations/accept/" + reservationId,
        method: 'PATCH',
    });
}

export function updateUserLevel(userId, userData) {
    return request({
        url: API_BASE_URL + "/users/"+userId,
        method: 'PATCH',
        body: JSON.stringify(userData)
    });
}

export function updateReservation(reservationId, reservationData) {
    return request({
        url: API_BASE_URL + "/reservations/"+reservationId,
        method: 'PATCH',
        body: JSON.stringify(reservationData)
    });
}

export function updateLesson(lessonId, lessonData) {
    return request({
        url: API_BASE_URL + "/lessons/"+lessonId,
        method: 'PATCH',
        body: JSON.stringify(lessonData)
    });
}

export function addPass(userId, data) {
    return request({
        url: API_BASE_URL + "/passes/"+ userId,
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export function payForReservation(reservationId, paymentType) {
    return request({
        url: API_BASE_URL + "/reservations/pay/" + reservationId,
        method: 'PATCH',
        body: JSON.stringify(paymentType)
    });
}

export function login(loginRequest) {
    return request({
        url: API_BASE_URL + "/auth/signin",
        method: 'POST',
        body: JSON.stringify(loginRequest)
    });
}

export function signup(signupRequest) {
    return request({
        url: API_BASE_URL + "/auth/signup",
        method: 'POST',
        body: JSON.stringify(signupRequest)
    });
}

export function checkUsernameAvailability(username) {
    return request({
        url: API_BASE_URL + "/user/checkUsernameAvailability?username=" + username,
        method: 'GET'
    });
}

export function checkEmailAvailability(email) {
    return request({
        url: API_BASE_URL + "/user/checkEmailAvailability?email=" + email,
        method: 'GET'
    });
}


export function getCurrentUser() {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/user/me",
        method: 'GET'
    });
}

export function getLesson(lessonId) {
    return request({
        url: API_BASE_URL + "/lessons/" + lessonId,
        method: 'GET'
    });
}

export function getUserProfile(username) {
    return request({
        url: API_BASE_URL + "/users/" + username,
        method: 'GET'
    });
}

export function getAllEvents(page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/events?page=" + page + "&size=" + size,
        method: 'GET'
    });
}

export function createEvent(eventData) {
    return request({
        url: API_BASE_URL + "/events",
        method: 'POST',
        body: JSON.stringify(eventData)
    });
}

export function castVote(voteData) {
    return request({
        url: API_BASE_URL + "/events/" + voteData.eventId + "/votes",
        method: 'POST',
        body: JSON.stringify(voteData)
    });
}

export function getUserCreatedEvents(username, page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/" + username + "/events?page=" + page + "&size=" + size,
        method: 'GET'
    });
}

export function getUserVotedEvents(username, page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/" + username + "/votes?page=" + page + "&size=" + size,
        method: 'GET'
    });
}
