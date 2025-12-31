// Sustav za zakazivanje termina s EmailJS integracijom
function initBooking() {
    // EmailJS konfiguracija - OVJE PROMIJENI SA SVOJIM PODACIMA!
    const EMAILJS_CONFIG = {
        SERVICE_ID: 'service_27jig6f',     // Zamijeni sa svojim Service ID
        TEMPLATE_ID: 'template_12n2jvj',    // Zamijeni sa svojim Template ID
        PUBLIC_KEY: 'ojOOClgR6mHjjJIsl',         // Zamijeni sa svojim Public Key
        ADMIN_EMAIL: 'ensar.modronja@gmail.com'  // Tvoj email
    };
    
    // DOM elementi
    const calendar = document.getElementById('calendar');
    const currentMonthEl = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const bookingForm = document.getElementById('bookingForm');
    const submitBookingBtn = document.getElementById('submitBooking');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const bookingNumberEl = document.getElementById('bookingNumber');
    const newBookingBtn = document.getElementById('newBookingBtn');
    
    // Prikazi elementa
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const selectedTimeDisplay = document.getElementById('selectedTimeDisplay');
    const selectedServiceDisplay = document.getElementById('selectedServiceDisplay');
    const bookingStatus = document.getElementById('bookingStatus');
    
    // Trenutni datum i odabrani podaci
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    let selectedService = null;
    
    // Simulirani zauzeti termini (u praksi bi ovo došlo s backenda)
    const bookedSlots = {
        '2023-10-15': ['09:00', '14:00'],
        '2023-10-18': ['10:00', '13:00', '16:00'],
        '2023-10-22': ['11:00', '15:00'],
        '2023-10-25': ['08:00', '12:00', '17:00']
    };
    
    // Vremenski slotovi
    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00'
    ];
    
    // Inicijalizacija kalendara
    function initCalendar() {
        updateCalendar();
        updateTimeSlots();
        
        // Postavi današnji datum kao odabrani ako je dostupan
        const today = new Date();
        const todayFormatted = formatDate(today);
        const todayCell = document.querySelector(`[data-date="${todayFormatted}"]`);
        
        if (todayCell && !todayCell.classList.contains('disabled')) {
            selectDate(todayFormatted);
        }
    }
    
    // Ažuriraj prikaz kalendara
    function updateCalendar() {
        if (!calendar || !currentMonthEl) return;
        
        // Dobij prvi dan u mjesecu i broj dana u mjesecu
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Ažuriraj naslov mjeseca
        const monthNames = [
            'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
            'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
        ];
        
        currentMonthEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        // Generiraj zaglavlje dana u tjednu
        const dayNames = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
        let calendarHTML = '';
        
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Dodaj prazna polja za dane prije početka mjeseca
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        
        for (let i = 0; i < startDay; i++) {
            calendarHTML += `<div class="calendar-day disabled"></div>`;
        }
        
        // Generiraj dane u mjesecu
        const today = new Date();
        const todayFormatted = formatDate(today);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateFormatted = formatDate(date);
            
            // Provjeri je li dan u prošlosti
            const isPast = date < today && dateFormatted !== todayFormatted;
            // Provjeri je li vikend
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            // Provjeri je li danas
            const isToday = dateFormatted === todayFormatted;
            
            let dayClass = 'calendar-day';
            if (isPast) dayClass += ' disabled';
            if (isWeekend) dayClass += ' weekend';
            if (isToday) dayClass += ' today';
            if (dateFormatted === selectedDate) dayClass += ' selected';
            
            calendarHTML += `
                <div class="${dayClass}" data-date="${dateFormatted}" ${isPast ? 'disabled' : ''}>
                    ${day}
                </div>
            `;
        }
        
        calendar.innerHTML = calendarHTML;
        
        // Dodaj event listenere za dane
        const dayElements = calendar.querySelectorAll('.calendar-day:not(.disabled)');
        dayElements.forEach(dayEl => {
            dayEl.addEventListener('click', function() {
                const date = this.getAttribute('data-date');
                selectDate(date);
            });
        });
    }
    
    // Ažuriraj vremenski slotovi
    function updateTimeSlots() {
        if (!timeSlotsContainer || !selectedDate) return;
        
        // Provjeri zauzete slotove za odabrani datum
        const bookedForDate = bookedSlots[selectedDate] || [];
        
        // Generiraj slotove
        let slotsHTML = '';
        
        timeSlots.forEach(slot => {
            const isBooked = bookedForDate.includes(slot);
            const isSelected = slot === selectedTime;
            let slotClass = 'time-slot';
            
            if (isBooked) slotClass += ' booked';
            if (isSelected) slotClass += ' selected';
            
            slotsHTML += `
                <div class="${slotClass}" data-time="${slot}" ${isBooked ? 'disabled' : ''}>
                    ${slot}
                </div>
            `;
        });
        
        timeSlotsContainer.innerHTML = slotsHTML;
        
        // Dodaj event listenere za slotove
        const slotElements = timeSlotsContainer.querySelectorAll('.time-slot:not(.booked)');
        slotElements.forEach(slotEl => {
            slotEl.addEventListener('click', function() {
                const time = this.getAttribute('data-time');
                selectTime(time);
            });
        });
        
        // Ako nije odabran slot, odaberi prvi dostupni
        if (!selectedTime && slotElements.length > 0) {
            const firstAvailable = slotElements[0];
            selectTime(firstAvailable.getAttribute('data-time'));
        }
    }
    
    // Odaberi datum
    function selectDate(date) {
        selectedDate = date;
        
        // Ažuriraj prikaz u kalendaru
        const allDays = calendar.querySelectorAll('.calendar-day');
        allDays.forEach(day => {
            day.classList.remove('selected');
            if (day.getAttribute('data-date') === date) {
                day.classList.add('selected');
            }
        });
        
        // Resetiraj odabrano vrijeme
        selectedTime = null;
        
        // Ažuriraj prikaz
        updateSelectedDisplay();
        updateTimeSlots();
    }
    
    // Odaberi vrijeme
    function selectTime(time) {
        selectedTime = time;
        
        // Ažuriraj prikaz u slotovima
        const allSlots = timeSlotsContainer.querySelectorAll('.time-slot');
        allSlots.forEach(slot => {
            slot.classList.remove('selected');
            if (slot.getAttribute('data-time') === time) {
                slot.classList.add('selected');
            }
        });
        
        // Ažuriraj prikaz
        updateSelectedDisplay();
    }
    
    // Ažuriraj prikaz odabranog termina
    function updateSelectedDisplay() {
        if (selectedDate && selectedTime) {
            // Formatiraj datum
            const dateObj = new Date(selectedDate);
            const formattedDate = dateObj.toLocaleDateString('hr-HR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            selectedDateDisplay.textContent = formattedDate;
            selectedTimeDisplay.textContent = selectedTime;
            bookingStatus.textContent = 'Dostupan';
            bookingStatus.style.color = '#2ecc71';
            
            // Omogući dugme za potvrdu
            if (submitBookingBtn) {
                submitBookingBtn.disabled = false;
            }
        } else {
            selectedDateDisplay.textContent = 'Nije odabran';
            selectedTimeDisplay.textContent = 'Nije odabrano';
            bookingStatus.textContent = 'Čeka odabir';
            bookingStatus.style.color = '#e74c3c';
            
            // Onemogući dugme za potvrdu
            if (submitBookingBtn) {
                submitBookingBtn.disabled = true;
            }
        }
        
        // Ažuriraj prikaz usluge ako je odabrana
        const serviceSelect = document.getElementById('serviceType');
        if (serviceSelect && serviceSelect.value) {
            selectedService = serviceSelect.value;
            selectedServiceDisplay.textContent = selectedService;
        } else {
            selectedServiceDisplay.textContent = 'Nije odabrana';
        }
    }
    
    // Promjena mjeseca
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCalendar();
        });
    }
    
    // Praćenje promjene usluge
    const serviceSelect = document.getElementById('serviceType');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            selectedService = this.value;
            updateSelectedDisplay();
        });
    }
    
    // Funkcija za slanje emaila preko EmailJS
    function sendBookingEmail(bookingData) {
        // Generiraj jedinstvene URL-ove za potvrdu i odbijanje
        const baseUrl = window.location.origin;
        const confirmUrl = `${baseUrl}/admin.html?booking=${bookingData.id}&action=confirm`;
        const rejectUrl = `${baseUrl}/admin.html?booking=${bookingData.id}&action=reject`;

        // Pripremi podatke za email
        const templateParams = {
            broj: bookingData.id,
            datum: bookingData.date,
            vrijeme: bookingData.time,
            ime: bookingData.clientName,
            telefon: bookingData.clientPhone,
            email: 'ensar.modronja@gmail.com',
            adresa: bookingData.clientAddress,
            usluga: bookingData.serviceType,
            opis: bookingData.problemDescription,
            potvrdi_url: confirmUrl,
            odbij_url: rejectUrl,
            admin_email: EMAILJS_CONFIG.ADMIN_EMAIL,
            klijent_email: bookingData.clientEmail,
        };
        
        // Učitaj EmailJS biblioteku ako nije već učitana
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = function() {
                emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
                sendEmail(templateParams);
            };
            document.head.appendChild(script);
        } else {
            sendEmail(templateParams);
        }
        
        function sendEmail(params) {
            emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                params
            )
            .then(function(response) {
                console.log('Email uspješno poslan!', response.status, response.text);
            }, function(error) {
                console.error('Greška pri slanju emaila:', error);
                // Fallback: pošalji obični mailto link
                sendFallbackEmail(params);
            });
        }
    }
    
    // Fallback ako EmailJS ne radi
    function sendFallbackEmail(bookingData) {
        const subject = `Nova rezervacija: ${bookingData.broj}`;
        const body = `
Nova rezervacija termina:

Broj: ${bookingData.broj}
Datum: ${bookingData.datum}
Vrijeme: ${bookingData.vrijeme}
Ime: ${bookingData.ime}
Telefon: ${bookingData.telefon}
Email: ${bookingData.email}
Adresa: ${bookingData.adresa}
Usluga: ${bookingData.usluga}
Opis: ${bookingData.opis}

---
Potvrdi ili odbij na: ${window.location.origin}/admin.html
`;
        
        const mailtoLink = `mailto:${EMAILJS_CONFIG.ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
    }
    
    // Slanje rezervacije
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Dohvati podatke iz forme
            const clientName = document.getElementById('clientName').value;
            const clientPhone = document.getElementById('clientPhone').value;
            const clientEmail = document.getElementById('clientEmail').value;
            const clientAddress = document.getElementById('clientAddress').value;
            const serviceType = document.getElementById('serviceType').value;
            const problemDescription = document.getElementById('problemDescription').value;
            
            // Validacija
            if (!selectedDate || !selectedTime) {
                alert('Molimo odaberite datum i vrijeme termina.');
                return;
            }
            
            if (!clientName || !clientPhone || !clientEmail || !clientAddress || !serviceType || !problemDescription) {
                alert('Molimo ispunite sva obavezna polja.');
                return;
            }
            
            // Generiraj broj rezervacije
            const bookingNumber = 'VX-' + Date.now().toString().slice(-6);
            
            // Kreiraj objekt rezervacije
            const bookingData = {
                id: bookingNumber,
                date: selectedDate,
                time: selectedTime,
                clientName: clientName,
                clientPhone: clientPhone,
                clientEmail: clientEmail,
                clientAddress: clientAddress,
                serviceType: serviceType,
                problemDescription: problemDescription,
                status: 'pending', // pending, confirmed, rejected
                timestamp: new Date().toISOString()
            };
            
            // Spremi u localStorage
            const existingBookings = JSON.parse(localStorage.getItem('vodoexpertBookings') || '[]');
            existingBookings.push(bookingData);
            localStorage.setItem('vodoexpertBookings', JSON.stringify(existingBookings));
            
            // Pošalji email adminu
            sendBookingEmail(bookingData);
            
            // Prikaži potvrdu korisniku
            bookingNumberEl.textContent = bookingNumber;
            confirmationMessage.classList.add('show');
            bookingForm.style.display = 'none';
            
            // Scrollaj na potvrdu
            confirmationMessage.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Nova rezervacija
    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', function() {
            // Resetiraj formu
            bookingForm.reset();
            bookingForm.style.display = 'block';
            confirmationMessage.classList.remove('show');
            
            // Resetiraj odabrane podatke
            selectedDate = null;
            selectedTime = null;
            selectedService = null;
            
            // Ponovno inicijaliziraj kalendar
            initCalendar();
            
            // Scrollaj na vrh forme
            bookingForm.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Pomoćne funkcije
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Inicijalizacija
    initCalendar();
    
    // Ažuriraj prikaz kada se stranica učita
    updateSelectedDisplay();
}