/**
 * Qualified Charitable Distribution (QCD) calculations
 * IRS rules: QCDs available at age 70½, excluded from taxable income, counts toward RMD
 */

const QCD_MINIMUM_AGE = 70.5;
const QCD_ANNUAL_LIMIT = 100000 * 100;

export function mustTakeQCD(age) {
  return age >= QCD_MINIMUM_AGE;
}

export function canAccountTakeQCD(accountType) {
  const eligibleTypes = ['IRA', '401k'];
  return eligibleTypes.includes(accountType);
}

export function calculateQCDForAccount(account, qcdSettings, rmdAmount) {
  if (!qcdSettings.enabled) {
    return 0;
  }

  const accountType = account.type;
  const accountBalance = account.balance || 0;

  if (!canAccountTakeQCD(accountType)) {
    return 0;
  }

  if (!mustTakeQCD(qcdSettings.currentAge)) {
    return 0;
  }

  let qcdAmount;

  if (qcdSettings.strategy === 'fixed') {
    qcdAmount = qcdSettings.annualAmount || 0;
  } else if (qcdSettings.strategy === 'percentage') {
    qcdAmount = Math.round(accountBalance * (qcdSettings.percentage || 0));
  } else if (qcdSettings.strategy === 'rmd') {
    qcdAmount = rmdAmount || 0;
  } else {
    return 0;
  }

  const maxQCD = Math.min(accountBalance, QCD_ANNUAL_LIMIT);
  return Math.min(qcdAmount, maxQCD);
}

export function calculateTotalQCD(accounts, qcdSettings, rmdAmount) {
  return accounts.reduce((total, account) => {
    return total + calculateQCDForAccount(account, qcdSettings, rmdAmount);
  }, 0);
}

export function getQCDLimit() {
  return QCD_ANNUAL_LIMIT;
}

export function getQCDMinimumAge() {
  return QCD_MINIMUM_AGE;
}

export function calculateQCDTaxBenefit(qcdAmount, marginalTaxRate) {
  if (qcdAmount <= 0) {
    return 0;
  }

  return qcdAmount * (marginalTaxRate || 0);
}

export function validateQCDSettings(settings) {
  const errors = [];

  if (!settings.enabled) {
    return errors;
  }

  if (!settings.strategy || !['fixed', 'percentage', 'rmd'].includes(settings.strategy)) {
    errors.push('Invalid QCD strategy');
  }

  if (settings.strategy === 'fixed' && (!settings.annualAmount || settings.annualAmount < 0)) {
    errors.push('Fixed QCD amount must be positive');
  }

  if (settings.strategy === 'percentage' && (!settings.percentage || settings.percentage <= 0 || settings.percentage > 1)) {
    errors.push('QCD percentage must be between 0 and 1');
  }

  return errors;
}
