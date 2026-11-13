/**
 * 业务错误类型枚举
 */
export enum BusinessErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INVALID_OPERATION = 'INVALID_OPERATION',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  INVALID_PRICE = 'INVALID_PRICE',
}

/**
 * 业务错误类
 *
 * 用途：
 * - 表示业务逻辑错误
 * - 提供结构化的错误信息
 * - 便于错误处理和用户提示
 *
 * @example
 * ```ts
 * // 使用工厂方法创建
 * throw BusinessError.validation('数量必须大于0', { quantity: -1 })
 *
 * // 或直接创建
 * throw new BusinessError('库存不足', BusinessErrorType.INSUFFICIENT_STOCK)
 * ```
 */
export class BusinessError extends Error {
  public readonly type: BusinessErrorType
  public readonly code: string
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    type: BusinessErrorType,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'BusinessError'
    this.type = type
    this.code = code || type
    this.details = details

    // 维护正确的原型链
    Object.setPrototypeOf(this, BusinessError.prototype)
  }

  // ==================== 工厂方法 ====================

  /**
   * 创建验证错误
   */
  static validation(message: string, details?: Record<string, any>): BusinessError {
    return new BusinessError(
      message,
      BusinessErrorType.VALIDATION_ERROR,
      'VALIDATION_ERROR',
      details
    )
  }

  /**
   * 创建业务规则违反错误
   */
  static businessRuleViolation(message: string, details?: Record<string, any>): BusinessError {
    return new BusinessError(
      message,
      BusinessErrorType.BUSINESS_RULE_VIOLATION,
      'BUSINESS_RULE_VIOLATION',
      details
    )
  }

  /**
   * 创建资源不存在错误
   */
  static notFound(resource: string, id: string): BusinessError {
    return new BusinessError('05b9590b.39891f', BusinessErrorType.NOT_FOUND, 'NOT_FOUND', {
      resource,
      id,
    })
  }

  /**
   * 创建资源已存在错误
   */
  static alreadyExists(resource: string, id: string): BusinessError {
    return new BusinessError(
      '05b9590b.8a026c',
      BusinessErrorType.ALREADY_EXISTS,
      'ALREADY_EXISTS',
      {
        resource,
        id,
      }
    )
  }

  /**
   * 创建无效操作错误
   */
  static invalidOperation(message: string, details?: Record<string, any>): BusinessError {
    return new BusinessError(
      message,
      BusinessErrorType.INVALID_OPERATION,
      'INVALID_OPERATION',
      details
    )
  }

  /**
   * 创建库存不足错误
   */
  static insufficientStock(productName: string, stock: number): BusinessError {
    return new BusinessError(
      '05b9590b.8b73b7',
      BusinessErrorType.INSUFFICIENT_STOCK,
      'INSUFFICIENT_STOCK',
      { productName, stock }
    )
  }

  /**
   * 创建数量无效错误
   */
  static quantityInvalid(quantity: number, min: number = 1): BusinessError {
    return new BusinessError(
      '05b9590b.58ad7b',
      BusinessErrorType.INVALID_QUANTITY,
      'INVALID_QUANTITY',
      { quantity, min }
    )
  }

  // ==================== 工具方法 ====================

  /**
   * 格式化错误消息
   */
  format(): string {
    let message = `[${this.type}] ${this.message}`
    if (this.details) {
      message += `\n${JSON.stringify(this.details, null, 2)}`
    }
    return message
  }

  /**
   * 转换为 JSON 对象
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      details: this.details,
    }
  }
}
