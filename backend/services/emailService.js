const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendBookingNotificationToBusiness(business, booking) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: business.email,
      subject: `New Booking Request - ${booking._id}`,
      html: `
        <h2>New Booking Request</h2>
        <p>You have received a new booking request:</p>
        
        <h3>Customer Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${booking.customerInfo.name}</li>
          <li><strong>Email:</strong> ${booking.customerInfo.email}</li>
          <li><strong>Phone:</strong> ${booking.customerInfo.phone}</li>
        </ul>
        
        <h3>Trip Details:</h3>
        <ul>
          <li><strong>From:</strong> ${booking.origin}</li>
          <li><strong>To:</strong> ${booking.destination}</li>
          <li><strong>Date & Time:</strong> ${new Date(booking.scheduledTime).toLocaleString()}</li>
          <li><strong>Passengers:</strong> ${booking.passengerCount}</li>
          <li><strong>Vehicle Type:</strong> ${booking.customerInfo.vehicleType}</li>
        </ul>
        
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
        
        <p>Please log in to your dashboard to assign a vehicle and set pricing for this trip.</p>
        
        <a href="${process.env.FRONTEND_URL}/business/bookings/${booking._id}" 
           style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Booking
        </a>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPriceConfirmationToPassenger(booking, vehicle, proposedFare, confirmationToken) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: booking.customerInfo.email,
      subject: `Booking Confirmation Required - ${booking.business.name}`,
      html: `
        <h2>Your Booking Quote is Ready!</h2>
        <p>Hello ${booking.customerInfo.name},</p>
        
        <p>Thank you for your booking request with ${booking.business.name}. We have reviewed your trip and prepared a quote:</p>
        
        <h3>Trip Details:</h3>
        <ul>
          <li><strong>From:</strong> ${booking.origin}</li>
          <li><strong>To:</strong> ${booking.destination}</li>
          <li><strong>Date & Time:</strong> ${new Date(booking.scheduledTime).toLocaleString()}</li>
          <li><strong>Passengers:</strong> ${booking.passengerCount}</li>
        </ul>
        
        <h3>Assigned Vehicle:</h3>
        <ul>
          <li><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</li>
          <li><strong>Type:</strong> ${vehicle.type}</li>
          <li><strong>Capacity:</strong> ${vehicle.seatingCapacity} passengers</li>
          <li><strong>License Plate:</strong> ${vehicle.licensePlate}</li>
        </ul>
        
        <h3 style="color: #059669;">Total Fare: $${proposedFare}</h3>
        
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/booking/confirm/${confirmationToken}" 
             style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-right: 10px;">
            Confirm & Book
          </a>
          
          <a href="${process.env.FRONTEND_URL}/booking/decline/${confirmationToken}" 
             style="background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
            Decline
          </a>
        </div>
        
        <p><small>This quote is valid for 24 hours. Please confirm your booking to proceed.</small></p>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendDriverAssignmentNotification(driver, booking) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: driver.email,
      subject: `New Trip Assignment - ${booking._id}`,
      html: `
        <h2>New Trip Assignment</h2>
        <p>Hello ${driver.name},</p>
        
        <p>You have been assigned a new trip:</p>
        
        <h3>Trip Details:</h3>
        <ul>
          <li><strong>From:</strong> ${booking.origin}</li>
          <li><strong>To:</strong> ${booking.destination}</li>
          <li><strong>Date & Time:</strong> ${new Date(booking.scheduledTime).toLocaleString()}</li>
          <li><strong>Passengers:</strong> ${booking.passengerCount}</li>
          <li><strong>Fare:</strong> $${booking.fare}</li>
        </ul>
        
        <h3>Passenger Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${booking.customerInfo.name}</li>
          <li><strong>Phone:</strong> ${booking.customerInfo.phone}</li>
        </ul>
        
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        
        <a href="${process.env.FRONTEND_URL}/driver/trips/${booking._id}" 
           style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Trip Details
        </a>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendBookingConfirmationToPassenger(booking) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: booking.customerInfo.email,
      subject: `Booking Confirmed - ${booking.business.name}`,
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hello ${booking.customerInfo.name},</p>
        
        <p>Your booking has been confirmed and a driver will be assigned shortly.</p>
        
        <h3>Trip Details:</h3>
        <ul>
          <li><strong>From:</strong> ${booking.origin}</li>
          <li><strong>To:</strong> ${booking.destination}</li>
          <li><strong>Date & Time:</strong> ${new Date(booking.scheduledTime).toLocaleString()}</li>
          <li><strong>Vehicle:</strong> ${booking.vehicle.make} ${booking.vehicle.model}</li>
          <li><strong>Fare:</strong> $${booking.fare}</li>
        </ul>
        
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        
        <p>You will receive another notification once a driver is assigned to your trip.</p>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendTripStatusUpdateToPassenger(trip, status) {
    const statusMessages = {
      'on-the-way': 'Your driver is on the way!',
      'started': 'Your trip has started',
      'completed': 'Your trip has been completed'
    };

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: trip.passenger.email,
      subject: `Trip Update - ${statusMessages[status]}`,
      html: `
        <h2>${statusMessages[status]}</h2>
        <p>Hello ${trip.passenger.name},</p>
        
        <p>Your trip status has been updated:</p>
        
        <h3>Trip Details:</h3>
        <ul>
          <li><strong>From:</strong> ${trip.origin || trip.from}</li>
          <li><strong>To:</strong> ${trip.destination || trip.to}</li>
          <li><strong>Driver:</strong> ${trip.driver.name}</li>
          <li><strong>Driver Phone:</strong> ${trip.driver.phone}</li>
          <li><strong>Vehicle:</strong> ${trip.vehicle?.make} ${trip.vehicle?.model} (${trip.vehicle?.licensePlate})</li>
        </ul>
        
        <p><strong>Current Status:</strong> ${status.replace('-', ' ').toUpperCase()}</p>
        
        ${status === 'completed' ? `
          <p><strong>Fare:</strong> $${trip.fare}</p>
          <p>Thank you for choosing our service!</p>
        ` : ''}
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
