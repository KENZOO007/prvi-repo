// DODAJ OVAJ KOD NA SAMI POČETAK admin.js datoteke:
// Pročitaj URL parametre
const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get('booking');
const action = urlParams.get('action');

// Ako postoje parametri, izvrši akciju
if (bookingId && action) {
    if (action === 'confirm') {
        if (confirm(`Želite li potvrditi rezervaciju ${bookingId}?`)) {
            // Pozovi confirmBooking funkciju
            if (typeof confirmBooking === 'function') {
                confirmBooking(bookingId);
                alert(`Rezervacija ${bookingId} je potvrđena!`);
            }
        }
    } else if (action === 'reject') {
        const reason = prompt('Unesite razlog odbijanja (opcionalno):', '');
        if (reason !== null) { // Korisnik nije kliknuo "Cancel"
            // Pozovi rejectBooking funkciju
            if (typeof rejectBooking === 'function') {
                // Prvo moramo ažurirati rejectBooking da prihvati reason
                rejectBooking(bookingId, reason);
                alert(`Rezervacija ${bookingId} je odbijena!`);
            }
        }
    }
}
// Admin panel za upravljanje rezervacijama
document.addEventListener('DOMContentLoaded', function() {
    // DOM elementi
    const bookingsContainer = document.getElementById('bookingsContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let currentFilter = 'all';
    let bookings = [];
    
    // Učitaj rezervacije iz localStorage
    function loadBookings() {
        const savedBookings = localStorage.getItem('vodoexpertBookings');
        bookings = savedBookings ? JSON.parse(savedBookings) : [];
        displayBookings();
    }
    
    // Prikaži rezervacije
    function displayBookings() {
        if (!bookingsContainer) return;
        
        if (bookings.length === 0) {
            bookingsContainer.innerHTML = `
                <div class="no-bookings">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 20px; color: #bdc3c7;"></i>
                    <h3>Nema rezervacija</h3>
                    <p>Još nema rezervacija termina.</p>
                </div>
            `;
            return;
        }
        
        // Filtriraj rezervacije
        let filteredBookings = bookings;
        if (currentFilter !== 'all') {
            filteredBookings = bookings.filter(booking => booking.status === currentFilter);
        }
        
        // Sortiraj po datumu (najnovije prvo)
        filteredBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Generiraj HTML
        let bookingsHTML = '';
        
        filteredBookings.forEach(booking => {
            // Formatiraj datum
            const dateObj = new Date(booking.date);
            const formattedDate = dateObj.toLocaleDateString('hr-HR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            // Status klasa
            const statusClass = `status-${booking.status || 'pending'}`;
            const statusText = getStatusText(booking.status);
            
            bookingsHTML += `
                <div class="booking-card ${booking.status || 'pending'}">
                    <div class="booking-header">
                        <div class="booking-id">${booking.id}</div>
                        <div class="booking-status ${statusClass}">${statusText}</div>
                    </div>
                    
                    <div class="booking-details">
                        <div class="detail-item">
                            <span class="detail-label">Datum i vrijeme:</span>
                            ${formattedDate} u ${booking.time}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Klijent:</span>
                            ${booking.clientName}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Telefon:</span>
                            ${booking.clientPhone}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            ${booking.clientEmail}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Adresa:</span>
                            ${booking.clientAddress}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Usluga:</span>
                            ${booking.serviceType}
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Opis problema:</span>
                        <p>${booking.problemDescription}</p>
                    </div>
                    
                    ${booking.rejectionReason ? `
                        <div class="detail-item">
                            <span class="detail-label">Razlog odbijanja:</span>
                            <p style="color: #e74c3c; font-style: italic;">${booking.rejectionReason}</p>
                        </div>
                    ` : ''}
                    
                    ${(!booking.status || booking.status === 'pending') ? `
                        <div class="action-buttons">
                            <button class="btn btn-confirm" onclick="confirmBooking('${booking.id}')">
                                <i class="fas fa-check"></i> Potvrdi
                            </button>
                            <button class="btn btn-reject" onclick="showRejectReason('${booking.id}')">
                                <i class="fas fa-times"></i> Odbij
                            </button>
                        </div>
                        
                        <div class="reject-reason" id="rejectReason-${booking.id}">
                            <textarea id="reasonText-${booking.id}" placeholder="Unesite razlog odbijanja (opcionalno)..."></textarea>
                            <button class="btn btn-reject" onclick="rejectBooking('${booking.id}')" style="margin-top: 10px;">
                                <i class="fas fa-paper-plane"></i> Pošalji odbijanje
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        bookingsContainer.innerHTML = bookingsHTML;
    }
    
    // Funkcije za upravljanje rezervacijama (moraju biti globalne)
    window.confirmBooking = function(bookingId) {
        if (confirm('Jeste li sigurni da želite potvrditi ovu rezervaciju?')) {
            updateBookingStatus(bookingId, 'confirmed');
            alert('Rezervacija je potvrđena!');
        }
    };
    
    window.showRejectReason = function(bookingId) {
        const reasonDiv = document.getElementById(`rejectReason-${bookingId}`);
        reasonDiv.style.display = reasonDiv.style.display === 'block' ? 'none' : 'block';
    };
    
    window.rejectBooking = function(bookingId, reason = '') {
    // Ako nema razloga (klik iz admin panela), pitaj korisnika
    if (!reason) {
        reason = document.getElementById(`reasonText-${bookingId}`)?.value || '';
        
        if (!reason) {
            reason = prompt('Unesite razlog odbijanja (opcionalno):', '');
            if (reason === null) return; // Korisnik kliknuo "Cancel"
        }
    }
    
    if (confirm('Jeste li sigurni da želite odbiti ovu rezervaciju?')) {
        updateBookingStatus(bookingId, 'rejected', reason);
        alert('Rezervacija je odbijena!');
    }
};
    
    // Ažuriraj status rezervacije
    function updateBookingStatus(bookingId, status, reason = '') {
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = status;
            if (reason) {
                bookings[bookingIndex].rejectionReason = reason;
            }
            
            // Spremi u localStorage
            localStorage.setItem('vodoexpertBookings', JSON.stringify(bookings));
            
            // Ponovno prikaži
            displayBookings();
            
            // Pošalji email klijentu (simulacija)
            sendStatusEmail(bookings[bookingIndex], status, reason);
        }
    }
    
    // Pošalji email klijentu o statusu
    function sendStatusEmail(booking, status, reason) {
        console.log(`Email za klijenta ${booking.clientEmail}:`);
        console.log(`Rezervacija ${booking.id} je ${status === 'confirmed' ? 'POTVRĐENA' : 'ODBIJENA'}`);
        
        if (reason) {
            console.log(`Razlog: ${reason}`);
        }
        
        // Ovdje bi se dodala prava EmailJS integracija za slanje klijentu
    }
    
    // Pomoćna funkcija za tekst statusa
    function getStatusText(status) {
        switch(status) {
            case 'pending': return 'NA ČEKANJU';
            case 'confirmed': return 'POTVRĐENO';
            case 'rejected': return 'ODBIJENO';
            default: return 'NA ČEKANJU';
        }
    }
    
    // Filter funkcionalnost
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            displayBookings();
        });
    });
    
    // Inicijalno učitavanje
    loadBookings();
});