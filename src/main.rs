async fn index(req: actix_web::HttpRequest) -> &'static str {
	println!("REQ: {:?}", req);
	"Hello world!"
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
	std::env::set_var("RUST_LOG", "actix_web=info");
	env_logger::init();

	actix_web::HttpServer::new(|| {
		actix_web::App::new()
			.wrap(actix_web::middleware::Logger::default())
			.service(actix_web::web::resource("/index.html").to(|| async { "Hello world!" }))
			.service(actix_web::web::resource("/").to(index))
	})
	.bind(("127.0.0.1", 8080))?
	.run()
	.await
}
