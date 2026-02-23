/**
 * 日期格式化工具类
 */
export default class DateUtils {
  /**
   * 格式化日期
   * @param {Date|string|number} date
   * @param {string} format - 支持 YYYY MM DD HH mm ss
   */
  static format(date, format = 'YYYY-MM-DD') {
    if (!date) return ''
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    const hours = dateObj.getHours()
    const minutes = dateObj.getMinutes()
    const seconds = dateObj.getSeconds()
    const padZero = (num) => num.toString().padStart(2, '0')
    return format
      .replace('YYYY', year)
      .replace('MM', padZero(month))
      .replace('DD', padZero(day))
      .replace('HH', padZero(hours))
      .replace('mm', padZero(minutes))
      .replace('ss', padZero(seconds))
  }

  static formatDate(date) {
    return this.format(date, 'YYYY-MM-DD')
  }

  static formatDateTime(date) {
    return this.format(date, 'YYYY-MM-DD HH:mm:ss')
  }

  static formatYearMonth(date) {
    return this.format(date, 'YYYY-MM')
  }
}
