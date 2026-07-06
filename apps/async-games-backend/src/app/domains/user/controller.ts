import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './service';
import { User } from './user.entity';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from './user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // The service returns the domain User; map it to the API response DTO so the
  // declared return type is what is actually returned (and matches the Swagger
  // schema). User already omits sensitive fields (no passwordHash).
  private toResponse(user: User): UserResponseDTO {
    return Object.assign(new UserResponseDTO(), user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers(): Promise<UserResponseDTO[]> {
    const users = await this.userService.getAllUsers();
    return users.map((user) => this.toResponse(user));
  }

  // `id` is the users table primary key (uuid); reject non-UUID path params at
  // the boundary with a 400 rather than passing them to the repository layer.
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<UserResponseDTO> {
    return this.toResponse(await this.userService.getUserById(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(@Body() body: CreateUserDTO): Promise<UserResponseDTO> {
    return this.toResponse(await this.userService.createUser(body));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by id' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDTO
  ): Promise<UserResponseDTO> {
    return this.toResponse(await this.userService.updateUser(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by id' })
  deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
