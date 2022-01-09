import { AuthService } from './../service/auth.service';
import { ClienteService } from './../service/cliente.service';
import { Cliente } from './../model/Cliente';
import { PedidoService } from './../service/pedido.service';
import { Pedido } from './../model/Pedido';
import { CategoriaService } from 'src/app/service/categoria.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { Categoria } from '../model/Categoria';
import { Produto } from '../model/Produto';
import { ProdutoService } from '../service/produto.service';
import { AlertasService } from '../service/alertas.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  nome = environment.usuario;
  //email = environment.email;
  foto = environment.foto;
  tipo = environment.tipo;

  tipoUsuarioPut: string;
  confirmarUsuarioPost: string;
  confirmaSenha: string;

  listaDeProdutos: Produto[];
  produto: Produto = new Produto();

  usuario: Cliente = new Cliente();

  categoria: Categoria = new Categoria();
  listaDeCategoria: Categoria[];
  listaDePedidos: Pedido[];
  listaDeUsuarios: Cliente[];
  idCategoria: number;

  constructor(
    private router: Router,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private clienteService: ClienteService,
    private pedidosService: PedidoService,
    private auth: AuthService,
    private alertas: AlertasService

  ) { }

  ngOnInit() {
    window.scroll(0, 0);

    if(localStorage.getItem('token') == null) {
      this.router.navigate(['/login']);

    }

    this.findAllByProdutos();
    this.findAllByCategoria();
    this.findAllByPedidos();
    this.findAllByUsuarios();

  }

  /* LISTAGEM DE PRODUTOS NO DASHBOARD */
  /* TRAZ TODOS OS PRODUTOS CADASTRADOS NA BASE DE DADOS */
  findAllByProdutos() {
    this.produtoService.findAllByProdutos().subscribe((resp: Produto[]) => {
      this.listaDeProdutos = resp;

    })

  }

  findAllByUsuarios() {
    this.clienteService.findAllUsuarios().subscribe((resp: Cliente[]) => {
      this.listaDeUsuarios = resp;

    })

  }

  /* TRAZ SOMENTE UM UNICO PRODUTO POR MEIO DE SEUS ID */
  findByIdProduto(id: number) {
    this.produtoService.findByIdProduto(id).subscribe((resp: Produto) => {
      this.produto = resp;

    })

  }

  /* CARREGA TODOS OS PEDIDOS CADASTRADOS NA BASE DE DADOS */
  findAllByPedidos() {
    let existe = false;

    this.pedidosService.findAllByPedidos().subscribe((resp: Pedido[]) => {

      resp = resp.filter(item => item.cliente.tipo != "adm"); // REMOVE OS USUARIOS 'adm' DO ARRAY RESPOSTA

      this.listaDePedidos = resp; // CARREGA A LISTA DE PEDIDOS CADASTRADOS NA BASE DE DADOS

      this.listaDePedidos.map(produto => {

        var memoriaProduto = [new Produto()]; // INSTANCIA UM NOVO VALOR DE MEMORIA DO TIPO PRODUTO

        produto.valorTotal = Number(produto.valorTotal.toFixed(2)); // VALOR TOTAL AJUSTADO

        produto.produtos.map(item => {
          this.produtoService.findByIdProduto(item.id).subscribe((resp: Produto) => {
            memoriaProduto.map(verifica => { // NAVEGA NO ARRAY VERIFICANDO SE EXISTE DUPLICIDADE DE DADOS
              if(verifica.id == resp.id) {
                existe = true;

                verifica.qtdPedidoProduto = verifica.qtdPedidoProduto + 1; // SE O PRODUTO JA EXISTE NO ARRAY DE MEMORIA, ENTAO SE INCLUI SOMENTE O VALOR DE QTD DE PRODUTOS

                //console.log(`ITEM ${verifica.nome} FOI LOCALIZADO`);

              }else {
                existe = false;

                //console.log(`ITEM ${verifica.nome} NAO FOI LOCALIZADO`);

              }
            });

            if(existe == false) { // INSERE NO ARRAY O NOVO DADO SOMENTE SE O MESMO NAO CONSTAR NO ARRAY
              memoriaProduto.push(resp); // ARMAZENA OS PRODUTOS EM MEMORIA
            }

            existe = false; // RETORNA A VARAIVEL AUXILIAR PARA O VALOR DEFAULT

          });

        });

        memoriaProduto = memoriaProduto.splice(1, 1); // REMOVE O NOME PRODUTO DO ARRAY ANTES DE CARREGAR NO PRODUTO NOVAMENTE

        produto.produtos = memoriaProduto; // INSERE OS PRODUTOS DENTRO DO OBJETO PRODUTO VINCULADO AO PEDIDO

      });

    });

  }

  /* INSERE NA BASE DE DADOS UM NOVO PRODUTO */
  postProduto() {
    this.categoria.id = this.idCategoria;
    this.produto.categoria = this.categoria;

    this.produtoService.postProduto(this.produto).subscribe((resp: Produto) => {
      this.produto = resp;

      this.alertas.alertaMensagem('Produto adicionado com sucesso!');

      this.produto = new Produto();
      this.findAllByProdutos();

    }, erro => {
      if(erro.status == 500) {
        console.log(`Erro: ${erro.status}, algum dado esta sendo inserido incorretamente.`)

      }else if(erro.status >= 400 && erro.status < 500){
        console.log(`Erro: ${erro.status}, acesso nao autorizado, verifique seu login.`)

      }

    })

  }

  /* ATUALIZA UM PRODUTO JA EXISTENTE NA BASE DE DADOS */
  putProduto() {
    this.categoria.id = this.idCategoria;
    this.produto.categoria = this.categoria;

    this.produtoService.putProduto(this.produto).subscribe((resp: Produto) => {
      this.produto = resp;

      this.alertas.alertaMensagem('Produto atualizado com sucesso!');

      this.produto = new Produto();
      this.findAllByProdutos();

    }, erro => {
      if(erro.status == 500) {
        console.log(`Erro: ${erro.status}, algum dado esta sendo inserido incorretamente.`)

      }else if(erro.status >= 400 && erro.status < 500){
        console.log(`Erro: ${erro.status}, acesso nao autorizado, verifique seu login.`)

      }

    })

  }

  /* EXCLUI DA BASE DE DADOS UM PRODUTO JA EXISTENTE */
  deleteProduto(id: number) {
    this.produtoService.deleteProduto(id).subscribe(() => {
      this.alertas.alertaMensagem('Produto deleteado com sucesso!');

      this.findAllByProdutos();
    })

  }

  /* LISTAGEM DE CATEGORIAS NO DASHBOARD */
  /* TRAZ SOMENTE UM UNICO CATEGORIA POR MEIO DE SEUS ID */
  findByIdCategoria() {
    this.categoriaService.fintByIdCategoria(this.idCategoria).subscribe((resp: Categoria) => {
      this.categoria = resp;

    })

  }

  findByIdUsuario(id: number) {
    this.clienteService.findByIdUsuarios(id).subscribe((resp: Cliente) => {
      this.usuario = resp;

    })

  }

  /* TRAZ UM ITEM ESPECIFICO DE CATEGORIA INFORMANDO COMO PARAMETRO UM ID */
  findByIdCategoriaPut(id: number) {
    this.categoriaService.fintByIdCategoria(id).subscribe((resp: Categoria) => {
      this.categoria = resp;

    })

  }

  /* TRAZ TODAS AS CATEGORIAS CADASTRADOS NA BASE DE DADOS */
  findAllByCategoria() {
    this.categoriaService.findAllCategorias().subscribe((resp: Categoria[]) => {
      this.listaDeCategoria = resp;

    })

  }

  /* CRIAR UM NOVO ITEM DE CATEGORIA NA BASE DE DADOS */
  postCategoria() {
    this.categoriaService.postCategoria(this.categoria).subscribe((resp: Categoria) => {
      this.categoria = resp;
      this.alertas.alertaMensagem(`Categoria: ${this.categoria.nome} cadastrada com sucesso!`);

      this.categoria = new Categoria();

      this.findAllByCategoria();

    }, erro => {
      if(erro.status == 500) {
        console.log(`Erro: ${erro.status}, algum dado esta sendo inserido incorretamente.`);

      }else if(erro.status >= 400 && erro.status < 500){
        console.log(`Erro: ${erro.status}, acesso nao autorizado, verifique seu login.`);

      }

    })

  }

  /* CADASTRA UM NOVO USUARIO */
  postUsuario() {
    this.usuario.tipo = this.tipoUsuarioPut;

    if(this.usuario.senha != this.confirmarUsuarioPost){
      this.alertas.alertaMensagem("A senha estão incorretas!")

    }else{
      this.auth.cadastrar(this.usuario).subscribe((resp: Cliente) => {
        this.usuario = resp;

        this.alertas.alertaMensagem('Usuário cadastrado com sucesso!');

      })
    }
  }

  /* ATUALIZA UM DADO DE CATEGORIA NA BASE DE DADOS POR MEIO DO ID */
  putCategoria() {
    this.categoriaService.putCategoria(this.categoria).subscribe((resp: Categoria) => {
      this.categoria = resp;

      this.alertas.alertaMensagem(`Categoria: ${this.categoria.nome} atualizada com sucesso!`);

      this.categoria = new Categoria();
      this.findAllByCategoria();

    }, erro => {
      if(erro.status == 500) {
        console.log(`Erro: ${erro.status}, algum dado esta sendo inserido incorretamente.`)

      }else if(erro.status >= 400 && erro.status < 500){
        console.log(`Erro: ${erro.status}, acesso nao autorizado, verifique seu login.`)

      }

    })

  }

  putUsuario() {
    /* CADASTRA UM NOVO USUARIO NA BASE DE DADOS */
    this.usuario.tipo = this.tipoUsuarioPut;

    if(this.usuario.senha != this.confirmaSenha) {
      this.alertas.alertaMensagem("A senha estão incorretas!")

    }else{
      console.log(this.usuario);

      this.clienteService.putUsuario(this.usuario).subscribe(() => {
        this.alertas.alertaMensagem('Usuário atualizado com sucesso!');

        this.findAllByUsuarios();

      })
    }

  }

  /* EXCLUI UM DADO DE CATEGORIA NA BASE DE DADOS POR MEIO DO ID */
  deleteCategoria(id: number) {
    this.categoriaService.deleteCategoria(id).subscribe(() => {
      this.alertas.alertaMensagem('Categoria excluida com sucesso!');

      this.findAllByCategoria();
    })

  }

  /* DELETA USUARIO DA BASE DE DADOS */
  deleteUsuario(id: number) {
    this.clienteService.deletaUsuario(id).subscribe((resp) => {
      console.log(resp);
    });

  }

  /* ARMAZENA O TIPO DE USUARIO */
  tipoUsuario(event:any){
    this.tipoUsuarioPut = event.target.value;

  }

  /* VERIFICA SE A SENHA FOI DIGITADA CORRETAMENTE */
  confirmarSenha(event:any){
    this.confirmaSenha = event.target.value;

  }

  confirmarSenhaPost(event:any){
    this.confirmarUsuarioPost = event.target.value;

  }

}
