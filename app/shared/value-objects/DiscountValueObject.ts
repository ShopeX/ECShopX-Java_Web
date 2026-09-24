/**
 * 折扣值对象
 *
 * 用途：
 * - 封装折扣相关的业务逻辑
 * - 支持多种折扣表示方式
 * - 提供折扣计算和格式化
 *
 * 特点：
 * - 不可变（Immutable）
 * - 范围验证（0-100%）
 * - 支持折扣应用
 *
 * @example
 * ```ts
 * // 从百分比创建
 * const discount = DiscountValueObject.of(20)  // 20% off
 *
 * // 从价格计算
 * const currentPrice = MoneyValueObject.of(80)
 * const originalPrice = MoneyValueObject.of(100)
 * const discount = DiscountValueObject.fromPrices(currentPrice, originalPrice)
 *
 * // 应用折扣
 * const price = MoneyValueObject.of(100)
 * const discountedPrice = discount.applyTo(price)  // ¥80.00
 *
 * // 显示
 * console.log(discount.display)         // "20%"
 * console.log(discount.displayChinese)  // "8折"
 * ```
 */

import { MoneyValueObject } from './MoneyValueObject'

export class DiscountValueObject {
  private readonly _percent: number

  private constructor(percent: number) {
    if (percent < 0 || percent > 100) {
      throw new Error('折扣范围必须在 0-100 之间')
    }
    // 保留两位小数
    this._percent = Math.round(percent * 100) / 100
  }

  // ==================== 工厂方法 ====================

  /**
   * 从折扣百分比创建
   * @param percent - 折扣百分比（0-100），如 20 表示打 8 折
   */
  static of(percent: number): DiscountValueObject {
    return new DiscountValueObject(percent)
  }

  /**
   * 从小数创建折扣
   * @param decimal - 小数形式（0-1），如 0.2 表示打 8 折
   */
  static fromDecimal(decimal: number): DiscountValueObject {
    if (decimal < 0 || decimal > 1) {
      throw new Error('折扣小数必须在 0-1 之间')
    }
    return new DiscountValueObject(decimal * 100)
  }

  /**
   * 从价格计算折扣
   * @param currentPrice - 当前价格
   * @param originalPrice - 原价
   */
  static fromPrices(
    currentPrice: MoneyValueObject,
    originalPrice: MoneyValueObject
  ): DiscountValueObject {
    // 如果原价小于等于当前价格，则无折扣
    if (originalPrice.isLessThanOrEqual(currentPrice)) {
      return new DiscountValueObject(0)
    }

    // 计算折扣百分比
    const percent = ((originalPrice.amount - currentPrice.amount) / originalPrice.amount) * 100

    return new DiscountValueObject(percent)
  }

  /**
   * 无折扣
   */
  static none(): DiscountValueObject {
    return new DiscountValueObject(0)
  }

  // ==================== Getters ====================

  /**
   * 获取折扣百分比（0-100）
   */
  get percent(): number {
    return this._percent
  }

  /**
   * 获取折扣小数形式（0-1）
   * 如：20% → 0.2
   */
  get decimal(): number {
    return this._percent / 100
  }

  /**
   * 获取折后比例（0-1）
   * 如：20% off → 0.8
   */
  get rate(): number {
    return 1 - this.decimal
  }

  /**
   * 格式化显示：20%
   */
  get display(): string {
    if (this._percent === 0) return '无折扣'
    return `${this._percent}%`
  }

  /**
   * 中文折扣显示：8折
   */
  get displayChinese(): string {
    if (this._percent === 0) return '原价'
    const zhe = (100 - this._percent) / 10
    return `${zhe.toFixed(1)}折`
  }

  // ==================== 业务方法 ====================

  /**
   * 应用折扣到价格
   * @param price - 原价
   * @returns 折后价
   */
  applyTo(price: MoneyValueObject): MoneyValueObject {
    return price.multiply(this.rate)
  }

  /**
   * 计算折扣金额
   * @param price - 原价
   * @returns 优惠金额
   */
  calculateSavings(price: MoneyValueObject): MoneyValueObject {
    return price.multiply(this.decimal)
  }

  /**
   * 是否无折扣
   */
  isNoDiscount(): boolean {
    return this._percent === 0
  }

  /**
   * 是否有折扣
   */
  hasDiscount(): boolean {
    return this._percent > 0
  }

  /**
   * 是否大折扣（>= 30%）
   */
  isBigDiscount(): boolean {
    return this._percent >= 30
  }

  // ==================== 值对象比较 ====================

  /**
   * 判断是否相等
   */
  equals(other: DiscountValueObject): boolean {
    return this._percent === other._percent
  }

  /**
   * 是否大于另一个折扣
   */
  isGreaterThan(other: DiscountValueObject): boolean {
    return this._percent > other._percent
  }

  /**
   * 是否小于另一个折扣
   */
  isLessThan(other: DiscountValueObject): boolean {
    return this._percent < other._percent
  }
}
