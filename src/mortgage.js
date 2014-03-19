function Mortgage (options) {
    this.sum = options.sum; //сумма кредита
    this.period = options.period; //период месяцев
    this.type = options.type; //схема расчета (аннуитетные или дифференцированные платежи)
    this.rate = options.rate; //процентная ставка
    this.firstPayment = options.firstPayment; //первоначальный взнос
}

Mortgage.prototype = {
    getPeriodPayment: function(period, firstPayment) { //ежемесячный платеж
        var periodPercent = this.rate * (1/(12*100));
        var period = typeof period === 'number' ? period : this.period;
        if (this.type === 'annuity') {
            return (this.getCreditSum(firstPayment) * periodPercent) / (1 - Math.pow(1 + periodPercent, 1 - period));
        } else if (this.type === 'differentiated') {
            return null;
        }
    },
    getOverPayment: function(period, firstPayment) { //переплата
        var period = typeof period === 'number' ? period : this.period;
        if (this.type === 'annuity') {
            return period * this.getPeriodPayment(period, firstPayment) - this.getCreditSum(firstPayment);
        } else if (this.type === 'differentiated') {
            return null;
        }
    },
    getTotalPayment: function() { //полные затраты
        if (this.type === 'annuity') {
            return this.period * this.getPeriodPayment();
        } else if (this.type === 'differentiated') {
            return null;
        }
    },
    getCreditSum: function(firstPayment) { //сумма кредита
        return this.sum - (typeof firstPayment === 'number' ? firstPayment : this.firstPayment);
    },
    getPeriodPaymentsByPeriods: function(min, max) { //ежемесячные выплаты в зависимости от срока ипотеки
        var payments = [];
        for (var period = min; period <= max; period ++)
        {
            payments.push({period: period, periodPayment: this.getPeriodPayment(period)});
        }

        return payments;
    },
    getPeriodPaymentsByFirstPayment: function(min, max) { //ежемесячные выплаты в зависимости от первоначального взноса
        var payments = [];
        for (var firstPayment = min; firstPayment <= max; firstPayment += 10000)
        {
            payments.push({firstPayment: firstPayment, periodPayment: this.getPeriodPayment(null, firstPayment)});
        }

        return payments;
    },
    getPeriodPaymentsByPeriodsAndFirstPayment: function(periodMin, periodMax, firstPaymentMin, firstPaymentMax) { //ежемесячные выплаты в зависимости от срока ипотеки и первоначального взноса
        var payments = [];
        for (var period = periodMin; period <= periodMax; period ++)
        {
            for (var firstPayment = firstPaymentMin; firstPayment <= firstPaymentMax; firstPayment += 10000)
            {
                payments.push({
                    period: period,
                    firstPayment: firstPayment,
                    periodPayment: this.getPeriodPayment(period, firstPayment)
                });
            }
        }

        return payments;
    },
    filterPeriodPayments: function (periodPayments, paymentMin, paymentMax) { //фильтр вариантов по размеру ежемесячного платежа
        var payments = [];
        periodPayments.forEach(function(item) {
            if (item.periodPayment >= paymentMin && item.periodPayment <= paymentMax) {
                payments.push(item);
            }
        });

        return payments;
    },
    getProfitablePeriodPayment: function (periodPayments) { //поиск самого выгодного варианта
        var payment = null;
        var that = this;
        periodPayments.forEach(function(item) {
            if (!payment) {
                payment = item;
            }
            /*
            if (that.getOverPayment(payment.period, payment.firstPayment) > that.getOverPayment(item.period, item.firstPayment)) {
                payment = item;
            }
            */
        });

        return payment;
    }
};
