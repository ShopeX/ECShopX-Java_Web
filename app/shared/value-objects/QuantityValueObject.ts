/**
 * 数量值对象
 *
 * 用途：
 * - 封装数量相关的业务逻辑和验证
 * - 确保数量的有效性（范围、整数）
 * - 提供数量运算方法
 *
 * 特点：
 * - 不可变（Immutable）
 * - 自动验证范围
 * - 只允许整数
 *
 * @example
 * ```ts
 * const qty = QuantityValueObject.of(5, 1, 10)  // 数量为5，范围1-10
 * const newQty = qty.increment()  // 增加1，变为6
 * console.log(newQty.value)       // 6
 * ```
 */
export class QuantityValueObject {
  readonly _value: number
  readonly _min: number
  readonly _max: number

  private constructor(value: number, min: number = 1, max: number = 9999) {
    if (value < min) {
      throw new Error('7cdb537c.f5e7f1')
    }
    if (value > max) {
      throw new Error('7cdb537c.7751b7')
    }
    if (!Number.isInteger(value)) {
      throw new Error('7cdb537c.084485')
    }
    this._value = value
    this._min = min
    this._max = max
  }

  // ==================== 工厂方法 ====================

  /**
   * 创建数量值对象
   */
  static of(value: number, min: number = 1, max: number = 9999): QuantityValueObject {
    return new QuantityValueObject(value, min, max)
  }

  /**
   * 创建默认数量（1）
   */
  static default(): QuantityValueObject {
    return new QuantityValueObject(1)
  }

  // ==================== Getters ====================

  /**
   * 获取数量值
   */
  get value(): number {
    return this._value
  }

  /**
   * 获取最小值
   */
  get min(): number {
    return this._min
  }

  /**
   * 获取最大值
   */
  get max(): number {
    return this._max
  }

  // ==================== 不可变操作（返回新对象） ====================

  /**
   * 增加数量
   */
  add(amount: number): QuantityValueObject {
    return new QuantityValueObject(this._value + amount, this._min, this._max)
  }

  /**
   * 减少数量
   */
  subtract(amount: number): QuantityValueObject {
    return new QuantityValueObject(this._value - amount, this._min, this._max)
  }

  /**
   * 增加 1
   */
  increment(): QuantityValueObject {
    return this.add(1)
  }

  /**
   * 减少 1
   */
  decrement(): QuantityValueObject {
    return this.subtract(1)
  }

  // ==================== 比较方法 ====================

  /**
   * 判断是否相等
   */
  equals(other: QuantityValueObject): boolean {
    return this._value === other._value
  }

  /**
   * 判断是否大于
   */
  isGreaterThan(other: QuantityValueObject | number): boolean {
    const compareValue = typeof other === 'number' ? other : other._value
    return this._value > compareValue
  }

  /**
   * 判断是否小于
   */
  isLessThan(other: QuantityValueObject | number): boolean {
    const compareValue = typeof other === 'number' ? other : other._value
    return this._value < compareValue
  }

  /**
   * 判断是否大于等于
   */
  isGreaterThanOrEqual(other: QuantityValueObject | number): boolean {
    const compareValue = typeof other === 'number' ? other : other._value
    return this._value >= compareValue
  }

  /**
   * 判断是否小于等于
   */
  isLessThanOrEqual(other: QuantityValueObject | number): boolean {
    const compareValue = typeof other === 'number' ? other : other._value
    return this._value <= compareValue
  }

  /**
   * 判断是否达到最大值
   */
  isAtMax(): boolean {
    return this._value >= this._max
  }

  /**
   * 判断是否达到最小值
   */
  isAtMin(): boolean {
    return this._value <= this._min
  }

  /**
   * 验证数量是否有效
   */
  isValid(): boolean {
    return this._value >= this._min && this._value <= this._max
  }
}
