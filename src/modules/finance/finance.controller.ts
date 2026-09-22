import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { FinanceQueryDto } from './dto/finance-query.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { FinanceService } from './finance.service';

@Controller()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('services')
  listServices() {
    return this.financeService.listServices();
  }

  @Post('admin/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createService(@Body() dto: CreateServiceDto) {
    return this.financeService.createService(dto);
  }

  @Post('admin/invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  invoices(@CurrentUser() user: User, @Query('playerId') playerId?: string) {
    return this.financeService.listPlayerInvoices(user, playerId);
  }

  @Post('payments/initiate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  initiatePayment(@CurrentUser() user: User, @Body() dto: CreatePaymentDto) {
    return this.financeService.initiatePayment(user, dto);
  }

  @Post('payments/callback')
  callback(@Body() dto: PaymentCallbackDto) {
    return this.financeService.callback(dto);
  }

  @Post('admin/expenses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createExpense(@Body() dto: CreateExpenseDto) {
    return this.financeService.createExpense(dto);
  }

  @Get('admin/expenses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listExpenses(@Query() query: FinanceQueryDto) {
    return this.financeService.listExpenses(query);
  }

  @Get('admin/finance/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  summary(@Query() query: FinanceQueryDto) {
    return this.financeService.summary(query);
  }
}
