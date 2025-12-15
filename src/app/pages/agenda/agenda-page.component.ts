import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { ActivationBannerComponent } from '../../components/activation-banner/activation-banner.component';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  date: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  phone?: string;
  email?: string;
  funcionarioId: string;
  duration?: number; // em minutos
}

interface Funcionario {
  id: string;
  nome: string;
  foto?: string;
}

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ActivationBannerComponent],
  templateUrl: './agenda-page.component.html',
  styleUrls: ['./agenda-page.component.scss']
})
export class AgendaPageComponent {
  accountService = inject(AccountService);
  selectedDate = signal<Date>(new Date());
  selectedFilter = signal<string>('all');
  currentWeek = signal<Date>(new Date());
  currentMonth = signal<Date>(new Date());
  sidebarOpen = signal(false);
  viewMode = signal<'week' | 'day'>('week');
  selectedFuncionarioId = signal<string>('all');
  showFuncionarioDropdown = signal(false);
  
  allAppointments: Appointment[] = [];
  private _funcionarios: Funcionario[] = [];
  
  get funcionarios(): Funcionario[] {
    if (this.accountService.isAccountInactive()) {
      // Mock de funcionários para demonstração
      return [
        { id: 'mock-1', nome: 'Funcionário 1' },
        { id: 'mock-2', nome: 'Funcionário 2' },
        { id: 'mock-3', nome: 'Funcionário 3' }
      ];
    }
    return this._funcionarios;
  }
  
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  weekDaysFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Horários do dia (8h às 18h, intervalos de 30min)
  timeSlots: string[] = [];
  
  // Flag para garantir que os dados foram inicializados
  private initialized = false;
  
  // Dias da semana atual
  weekDaysDates: Date[] = [];
  
  // Dias do calendário mini
  calendarDays: Date[] = [];
  
  // Opções de mês/ano para o dropdown
  monthYearOptions: { value: string; label: string }[] = [];
  selectedMonthYear: string = '';

  constructor(private router: Router) {
    // Inicializar arrays vazios primeiro para evitar erros de renderização
    this.weekDaysDates = [];
    this.calendarDays = [];
    this.timeSlots = [];
    
    this.initializeFuncionarios();
    this.generateTimeSlots();
    this.generateWeekDays();
    this.generateMonthYearOptions();
    this.generateCalendar();
    this.initializeAppointments();
    
    // Marca como inicializado
    this.initialized = true;
  }

  initializeFuncionarios() {
    this._funcionarios = [
      { id: '1', nome: 'João Silva' },
      { id: '2', nome: 'Maria Santos' },
      { id: '3', nome: 'Pedro Costa' },
      { id: '4', nome: 'Ana Oliveira' }
    ];
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour < 19; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  generateWeekDays() {
    const weekStart = this.getWeekStart(this.currentWeek());
    this.weekDaysDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      this.weekDaysDates.push(date);
    }
    // Força detecção de mudanças
    this.weekDaysDates = [...this.weekDaysDates];
  }

  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  getWeekRange(): string {
    if (!this.weekDaysDates || this.weekDaysDates.length < 7) {
      return 'Carregando...';
    }
    const start = this.weekDaysDates[0];
    const end = this.weekDaysDates[6];
    if (!start || !end) {
      return 'Carregando...';
    }
    const startMonth = this.months[start.getMonth()];
    const endMonth = this.months[end.getMonth()];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} de ${startMonth} ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} de ${startMonth} - ${end.getDate()} de ${endMonth} ${start.getFullYear()}`;
    }
  }

  previousWeek() {
    const newDate = new Date(this.currentWeek());
    newDate.setDate(newDate.getDate() - 7);
    this.currentWeek.set(newDate);
    this.generateWeekDays();
  }

  nextWeek() {
    const newDate = new Date(this.currentWeek());
    newDate.setDate(newDate.getDate() + 7);
    this.currentWeek.set(newDate);
    this.generateWeekDays();
  }

  goToToday() {
    this.currentWeek.set(new Date());
    this.currentMonth.set(new Date());
    this.generateWeekDays();
    this.generateCalendar();
    this.selectedDate.set(new Date());
  }

  generateCalendar() {
    const year = this.currentMonth().getFullYear();
    const month = this.currentMonth().getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    this.calendarDays = [];
    
    // Adiciona dias vazios do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Adiciona dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(new Date(year, month, day));
    }
    
    // Preenche até completar 6 semanas (42 dias)
    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push(new Date(year, month + 1, day));
    }
    
    // Força detecção de mudanças
    this.calendarDays = [...this.calendarDays];
  }

  previousMonth() {
    const newDate = new Date(this.currentMonth());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentMonth.set(newDate);
    this.generateCalendar();
  }

  nextMonth() {
    const newDate = new Date(this.currentMonth());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentMonth.set(newDate);
    this.generateCalendar();
  }

  getMonthName(): string {
    if (!this.currentMonth()) {
      return 'Carregando...';
    }
    return this.months[this.currentMonth().getMonth()] || 'Carregando...';
  }

  getYear(): number {
    if (!this.currentMonth()) {
      return new Date().getFullYear();
    }
    return this.currentMonth().getFullYear();
  }

  generateMonthYearOptions() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    this.monthYearOptions = [];
    
    // Adiciona 12 meses anteriores
    for (let i = 12; i >= 1; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthName = this.months[date.getMonth()];
      const year = date.getFullYear();
      const value = `${date.getMonth()}-${year}`;
      this.monthYearOptions.push({
        value: value,
        label: `${monthName} ${year}`
      });
    }
    
    // Adiciona mês atual e próximos 12 meses
    for (let i = 0; i <= 12; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      const monthName = this.months[date.getMonth()];
      const year = date.getFullYear();
      const value = `${date.getMonth()}-${year}`;
      this.monthYearOptions.push({
        value: value,
        label: `${monthName} ${year}`
      });
    }
    
    // Define o mês atual como selecionado
    this.selectedMonthYear = `${currentMonth}-${currentYear}`;
  }

  onMonthYearChange() {
    const [month, year] = this.selectedMonthYear.split('-').map(Number);
    const newDate = new Date(year, month, 1);
    this.currentMonth.set(newDate);
    this.generateCalendar();
    
    // Ajusta a semana atual se necessário
    const weekStart = this.getWeekStart(this.currentWeek());
    if (weekStart.getMonth() !== month || weekStart.getFullYear() !== year) {
      // Se a semana atual não está no mês selecionado, vai para a primeira semana do mês
      const firstDay = new Date(year, month, 1);
      this.currentWeek.set(firstDay);
      this.generateWeekDays();
    }
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth().getMonth();
  }

  selectFuncionario(funcionarioId: string) {
    this.selectedFuncionarioId.set(funcionarioId);
    this.showFuncionarioDropdown.set(false);
  }

  toggleFuncionarioDropdown() {
    this.showFuncionarioDropdown.set(!this.showFuncionarioDropdown());
  }

  getSelectedFuncionarioName(): string {
    if (this.accountService.isAccountInactive()) {
      if (this.selectedFuncionarioId() === 'all') {
        return 'Agenda Completa';
      }
      const funcionario = this.funcionarios.find(f => f.id === this.selectedFuncionarioId());
      return funcionario ? funcionario.nome : 'Selecione';
    }
    if (this.selectedFuncionarioId() === 'all') {
      return 'Agenda Completa';
    }
    const funcionario = this._funcionarios.find(f => f.id === this.selectedFuncionarioId());
    return funcionario ? funcionario.nome : 'Selecione';
  }

  selectDate(date: Date) {
    this.selectedDate.set(date);
    // Atualiza a semana para mostrar a semana que contém a data clicada
    this.currentWeek.set(new Date(date));
    this.generateWeekDays();
  }
  
  selectDayFromHeader(day: Date) {
    // Quando clica no cabeçalho do dia, já está na semana correta, apenas atualiza a data selecionada
    this.selectedDate.set(new Date(day));
  }

  isSelected(date: Date): boolean {
    return date.getTime() === this.selectedDate().getTime() &&
           date.getMonth() === this.selectedDate().getMonth() &&
           date.getFullYear() === this.selectedDate().getFullYear();
  }

  isSelectedDay(date: Date): boolean {
    const selected = this.selectedDate();
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  setFilter(filter: string) {
    this.selectedFilter.set(filter);
  }

  getAppointmentsForDayAndTime(day: Date, time: string): Appointment[] {
    // Verificação de segurança
    if (!day || !time) return [];
    
    if (this.accountService.isAccountInactive()) {
      // Apenas 5 agendamentos mockados na semana
      const mockAppointments = this.getMockAppointmentsForWeek();
      
      // Verifica se este dia e horário tem um agendamento
      const dateKey = this.formatDateKey(day);
      const appointment = mockAppointments.find(apt => {
        const aptDateKey = this.formatDateKey(apt.date);
        return aptDateKey === dateKey && apt.time === time;
      });
      
      return appointment ? [appointment] : [];
    }
    const dateStr = this.formatDateKey(day);
    let appointments = this.allAppointments.filter(apt => {
      const aptDateStr = this.formatDateKey(apt.date);
      return aptDateStr === dateStr && apt.time === time;
    });
    
    // Aplica filtro de funcionário
    if (this.selectedFuncionarioId() !== 'all') {
      appointments = appointments.filter(apt => apt.funcionarioId === this.selectedFuncionarioId());
    }
    
    // Aplica filtro de status
    if (this.selectedFilter() !== 'all') {
      appointments = appointments.filter(apt => apt.status === this.selectedFilter());
    }
    
    return appointments;
  }

  getAppointmentsForDay(day: Date): Appointment[] {
    // Verificação de segurança
    if (!day) return [];
    
    if (this.accountService.isAccountInactive()) {
      // Retorna apenas os agendamentos mockados para este dia
      const mockAppointments = this.getMockAppointmentsForWeek();
      const dateKey = this.formatDateKey(day);
      
      return mockAppointments
        .filter(apt => {
          const aptDateKey = this.formatDateKey(apt.date);
          return aptDateKey === dateKey;
        })
        .sort((a, b) => a.time.localeCompare(b.time));
    }
    const dateStr = this.formatDateKey(day);
    let appointments = this.allAppointments.filter(apt => {
      const aptDateStr = this.formatDateKey(apt.date);
      return aptDateStr === dateStr;
    });
    
    // Aplica filtro de funcionário
    if (this.selectedFuncionarioId() !== 'all') {
      appointments = appointments.filter(apt => apt.funcionarioId === this.selectedFuncionarioId());
    }
    
    // Aplica filtro de status
    if (this.selectedFilter() !== 'all') {
      appointments = appointments.filter(apt => apt.status === this.selectedFilter());
    }
    
    return appointments.sort((a, b) => a.time.localeCompare(b.time));
  }

  formatDateKey(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  // Gera apenas 5 agendamentos mockados distribuídos na semana atual
  private getMockAppointmentsForWeek(): Appointment[] {
    const today = new Date();
    const weekStart = this.getWeekStart(today);
    const mockAppointments: Appointment[] = [];
    
    // 5 agendamentos distribuídos na semana (segunda a sexta)
    const appointments = [
      { dayOffset: 0, time: '09:00', clientName: 'Cliente 1' }, // Segunda
      { dayOffset: 1, time: '10:30', clientName: 'Cliente 2' }, // Terça
      { dayOffset: 2, time: '14:00', clientName: 'Cliente 3' }, // Quarta
      { dayOffset: 3, time: '11:00', clientName: 'Cliente 4' }, // Quinta
      { dayOffset: 4, time: '15:30', clientName: 'Cliente 5' }  // Sexta
    ];
    
    appointments.forEach((apt, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + apt.dayOffset);
      
      mockAppointments.push({
        id: `mock-${index + 1}`,
        clientName: apt.clientName,
        service: 'Seu Serviço',
        time: apt.time,
        date: date,
        status: 'confirmed' as const,
        funcionarioId: 'mock-1',
        duration: 60
      });
    });
    
    return mockAppointments;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    const dateStr = this.formatDateKey(date);
    return this.allAppointments.filter(apt => {
      const aptDateStr = this.formatDateKey(apt.date);
      return aptDateStr === dateStr;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return '';
    }
  }

  createAppointment() {
    // Navegar para criar agendamento
    console.log('Criar novo agendamento');
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  initializeAppointments() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Cria datas para os dias 16, 17, 18, 19 e 20 do mês atual
    const day16 = new Date(today.getFullYear(), today.getMonth(), 16);
    const day17 = new Date(today.getFullYear(), today.getMonth(), 17);
    const day18 = new Date(today.getFullYear(), today.getMonth(), 18);
    const day19 = new Date(today.getFullYear(), today.getMonth(), 19);
    const day20 = new Date(today.getFullYear(), today.getMonth(), 20);

    // Horários entre 9h30 e 14h30
    const specialTimes = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
    
    // Serviços variados
    const services = [
      'Corte Masculino', 'Corte Feminino', 'Barba', 'Corte + Barba',
      'Escova', 'Coloração', 'Manicure', 'Pedicure',
      'Massagem', 'Limpeza de Pele', 'Design de Sobrancelhas', 'Hidratação',
      'Manicure + Pedicure', 'Corte + Escova', 'Tratamento Capilar'
    ];
    
    // Clientes variados
    const clients = [
      'Carlos Mendes', 'Ana Paula', 'Roberto Silva', 'Juliana Costa',
      'Fernando Lima', 'Patricia Alves', 'Marcos Oliveira', 'Camila Santos',
      'Ricardo Pereira', 'Larissa Ferreira', 'Bruno Souza', 'Mariana Rocha',
      'Thiago Martins', 'Beatriz Gomes', 'Lucas Rodrigues', 'Isabela Nunes',
      'Gabriel Alves', 'Amanda Dias', 'Rafael Barbosa', 'Carolina Ribeiro',
      'Felipe Costa', 'Renata Silva', 'Diego Almeida', 'Vanessa Lima'
    ];

    this.allAppointments = [
      {
        id: '1',
        clientName: 'João Silva',
        service: 'Corte de Cabelo',
        time: '09:00',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        status: 'confirmed',
        phone: '(11) 11111-1111',
        email: 'joao@example.com',
        funcionarioId: '1',
        duration: 60
      },
      {
        id: '2',
        clientName: 'Maria Santos',
        service: 'Manicure',
        time: '10:30',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        status: 'confirmed',
        phone: '(11) 97654-3210',
        email: 'maria@example.com',
        funcionarioId: '2',
        duration: 45
      },
      {
        id: '3',
        clientName: 'Pedro Oliveira',
        service: 'Barba',
        time: '14:00',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        status: 'pending',
        phone: '(11) 96543-2109',
        email: 'pedro@example.com',
        funcionarioId: '1',
        duration: 30
      },
      {
        id: '4',
        clientName: 'Ana Costa',
        service: 'Pedicure',
        time: '15:30',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        status: 'confirmed',
        phone: '(11) 95432-1098',
        email: 'ana@example.com',
        funcionarioId: '3',
        duration: 60
      },
      {
        id: '5',
        clientName: 'Carlos Mendes',
        service: 'Corte + Barba',
        time: '16:00',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        status: 'pending',
        phone: '(11) 94321-0987',
        email: 'carlos@example.com',
        funcionarioId: '4',
        duration: 90
      },
      {
        id: '6',
        clientName: 'Fernanda Lima',
        service: 'Design de Sobrancelha',
        time: '11:00',
        date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
        status: 'confirmed',
        phone: '(11) 93210-9876',
        email: 'fernanda@example.com',
        funcionarioId: '2',
        duration: 30
      },
      {
        id: '7',
        clientName: 'Roberto Alves',
        service: 'Corte de Cabelo',
        time: '13:00',
        date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
        status: 'cancelled',
        phone: '(11) 92109-8765',
        email: 'roberto@example.com',
        funcionarioId: '1',
        duration: 60
      },
      {
        id: '8',
        clientName: 'Juliana Ferreira',
        service: 'Manicure + Pedicure',
        time: '09:30',
        date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
        status: 'confirmed',
        phone: '(11) 91098-7654',
        email: 'juliana@example.com',
        funcionarioId: '3',
        duration: 120
      },
      {
        id: '9',
        clientName: 'Lucas Souza',
        service: 'Barba',
        time: '14:30',
        date: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate()),
        status: 'pending',
        phone: '(11) 90987-6543',
        email: 'lucas@example.com',
        funcionarioId: '4',
        duration: 30
      },
      {
        id: '10',
        clientName: 'Patricia Rocha',
        service: 'Corte de Cabelo',
        time: '10:00',
        date: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate()),
        status: 'confirmed',
        phone: '(11) 89876-5432',
        email: 'patricia@example.com',
        funcionarioId: '1',
        duration: 60
      },
      {
        id: '11',
        clientName: 'Ricardo Martins',
        service: 'Corte + Barba',
        time: '15:00',
        date: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate()),
        status: 'confirmed',
        phone: '(11) 88765-4321',
        email: 'ricardo@example.com',
        funcionarioId: '2',
        duration: 90
      },
      {
        id: '12',
        clientName: 'Beatriz Almeida',
        service: 'Design de Sobrancelha',
        time: '11:30',
        date: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate()),
        status: 'pending',
        phone: '(11) 87654-3210',
        email: 'beatriz@example.com',
        funcionarioId: '3',
        duration: 30
      }
    ];

    // Adiciona agendamentos para os dias 16, 17, 18, 19 e 20
    const specialDays = [day16, day17, day18, day19, day20];
    let appointmentId = 13;
    
    specialDays.forEach((day, dayIndex) => {
      specialTimes.forEach((time, timeIndex) => {
        const serviceIndex = (dayIndex * specialTimes.length + timeIndex) % services.length;
        const clientIndex = (dayIndex * specialTimes.length + timeIndex) % clients.length;
        const funcionarioIndex = (dayIndex * specialTimes.length + timeIndex) % 4;
        const durationOptions = [30, 45, 60, 90];
        const duration = durationOptions[(dayIndex * specialTimes.length + timeIndex) % durationOptions.length];
        const status = timeIndex % 5 === 0 ? 'pending' : 'confirmed';
        
        this.allAppointments.push({
          id: appointmentId.toString(),
          clientName: clients[clientIndex],
          service: services[serviceIndex],
          time: time,
          date: new Date(day.getFullYear(), day.getMonth(), day.getDate()),
          status: status,
          phone: `(11) ${90000 + appointmentId}-${1000 + appointmentId}`,
          email: `${clients[clientIndex].toLowerCase().replace(' ', '')}@example.com`,
          funcionarioId: (funcionarioIndex + 1).toString(),
          duration: duration
        });
        
        appointmentId++;
      });
    });
  }

  getTimeSlotIndex(time: string): number {
    return this.timeSlots.indexOf(time);
  }

  getAppointmentHeight(appointment: Appointment): number {
    // Cada slot de 30min = 60px de altura
    const duration = appointment.duration || 60;
    const slots = duration / 30;
    return slots * 60;
  }

  getFuncionarioColor(funcionarioId: string): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    // Se for um ID mockado (começa com 'mock-'), usa um índice baseado no hash do ID
    if (funcionarioId.startsWith('mock-')) {
      const hash = funcionarioId.split('-').pop() || '1';
      const index = parseInt(hash) || 1;
      return colors[(index - 1) % colors.length];
    }
    const index = parseInt(funcionarioId) - 1;
    return colors[index >= 0 ? index % colors.length : 0];
  }

  getEventColorClass(funcionarioId: string): string {
    const classes = ['blue', 'green', 'orange', 'red'];
    // Se for um ID mockado (começa com 'mock-'), usa um índice baseado no hash do ID
    if (funcionarioId.startsWith('mock-')) {
      const hash = funcionarioId.split('-').pop() || '1';
      const index = parseInt(hash) || 1;
      return classes[(index - 1) % classes.length];
    }
    const index = parseInt(funcionarioId) - 1;
    return classes[index >= 0 ? index % classes.length : 0];
  }

  getEndTime(appointment: Appointment): string {
    const duration = appointment.duration || 60;
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/']);
  }
}

