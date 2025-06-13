# Freelance Rate Calculator

A simple, modern web application to help software engineering freelancers calculate their optimal pricing rates.

## Features

- **Clean, modern interface** with responsive design
- **Real-time calculations** as you type
- **Automatic synchronization** between monthly and annual expenses
- **Multiple rate types** including regular, revision, rush job, and difficult client rates
- **Percentage-based calculations** for savings, extra income, and taxes
- **Currency formatting** for professional presentation
- **Mobile-friendly** responsive design

## How to Use

1. Open `index.html` in your web browser
2. Enter your monthly expenses (this will auto-calculate annual costs)
3. Adjust the percentages for:
   - **Savings**: Money to save for the future
   - **Extra**: Personal spending money
   - **Taxes**: Tax obligations
4. Set multiplier factors for different job types:
   - **Revision Factor**: Extra charge for revision work
   - **Rush Factor**: Premium for urgent projects
   - **Difficult Client Factor**: Premium for challenging clients
5. View your calculated rates in the results table

## Understanding the Results

The calculator shows four different rate types:

- **Regular**: Your base rate to cover all expenses
- **Revision**: Rate for projects requiring revisions (+25% default)
- **Rush Job**: Rate for urgent projects (+50% default)
- **Difficult Client**: Rate for problematic clients (+100% default)

Each rate is shown both per day (8 hours) and per hour.

## Default Values

The calculator comes with reasonable defaults:

- **Work days per year**: 231 (accounts for weekends, holidays, and time off)
- **Savings percentage**: 20%
- **Extra percentage**: 10%
- **Tax percentage**: 25%
- **Revision factor**: 25%
- **Rush factor**: 50%
- **Difficult client factor**: 100%

## Customization

You can easily customize the calculator by:

- Modifying the default values in `rate-calculator.js`
- Adjusting the styling in `rate-calculator.css`
- Adding new fields or calculations as needed

## Files

- `index.html` - Main HTML structure
- `rate-calculator.css` - Styling and responsive design
- `rate-calculator.js` - Calculator logic and interactions

## Browser Support

Works in all modern browsers including:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Tips for Freelancers

1. **Research your market**: These are minimum rates - research what others charge in your area
2. **Account for downtime**: The 231 work days assumes you won't work every weekday
3. **Consider skill level**: Adjust rates based on your experience and specialization
4. **Factor in benefits**: Remember to account for health insurance, retirement, etc.
5. **Update regularly**: Review and adjust your rates quarterly

## License

Free to use and modify for personal and commercial purposes.
