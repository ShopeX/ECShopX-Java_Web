import { formatMoneyYuan } from '~/utils/currencyFormat'

/**
 * 金额值对象
 *
 * 用途：
 * - 封装金额相关的业务逻辑
 * - 确保金额的不可变性
 * - 避免浮点数精度问题
 * - 提供金额格式化
 *
 * 特点：
 * - 不可变（Immutable）
 * - 通过值比较
 * - 工厂方法创建
 *
 * @example
 * ```ts
 * const price = MoneyValueObject.of(99.9)
 * const total = price.multiply(2)  // MoneyValueObject.of(199.8)
 * console.log(total.display)       // "¥199.80"
 * ```
 */
export class MoneyValueObject {
  readonly _amount: number

  private constructor(amount: number) {
    if (amount < 0) {
      throw new Error('7cfd78c5.3b58b6')
    }
    // 保留两位小数，避免浮点数精度问题
    this._amount = Math.round(amount * 100) / 100
  }

  // ==================== 工厂方法 ====================

  /**
   * 创建金额值对象
   */
  static of(amount: number): MoneyValueObject {
    return new MoneyValueObject(amount)
  }

  /**
   * 创建零金额
   */
  static zero(): MoneyValueObject {
    return new MoneyValueObject(0)
  }

  // ==================== Getters ====================

  /**
   * 获取金额数值
   */
  get amount(): number {
    return this._amount
  }

  /**
   * 格式化显示（带货币符号和千分位）
   */
  get display(): string {
    return formatMoneyYuan(this._amount)
  }

  // ==================== 不可变操作（返回新对象） ====================

  /**
   * 金额相加
   */
  add(other: MoneyValueObject): MoneyValueObject {
    return new MoneyValueObject(this._amount + other._amount)
  }

  /**
   * 金额相减
   */
  subtract(other: MoneyValueObject): MoneyValueObject {
    return new MoneyValueObject(this._amount - other._amount)
  }

  /**
   * 金额乘法
   */
  multiply(factor: number): MoneyValueObject {
    return new MoneyValueObject(this._amount * factor)
  }

  /**
   * 金额除法
   */
  divide(divisor: number): MoneyValueObject {
    if (divisor === 0) {
      throw new Error('7cfd78c5.bd66a0')
    }
    return new MoneyValueObject(this._amount / divisor)
  }

  // ==================== 比较方法 ====================

  /**
   * 判断金额是否相等
   */
  equals(other: MoneyValueObject): boolean {
    return this._amount === other._amount
  }

  /**
   * 判断是否大于
   */
  isGreaterThan(other: MoneyValueObject): boolean {
    return this._amount > other._amount
  }

  /**
   * 判断是否小于
   */
  isLessThan(other: MoneyValueObject): boolean {
    return this._amount < other._amount
  }

  /**
   * 判断是否大于等于
   */
  isGreaterThanOrEqual(other: MoneyValueObject): boolean {
    return this._amount >= other._amount
  }

  /**
   * 判断是否小于等于
   */
  isLessThanOrEqual(other: MoneyValueObject): boolean {
    return this._amount <= other._amount
  }

  /**
   * 判断是否为零
   */
  isZero(): boolean {
    return this._amount === 0
  }

  /**
   * 判断是否为正数
   */
  isPositive(): boolean {
    return this._amount > 0
  }
}
