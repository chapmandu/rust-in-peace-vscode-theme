component extends="Controller" {

	public void function config() {
		protectsFromForgery();
		super.config();
	}

	// CRUD

	public void function index() {
		users = model("User").findAll(
			handle = "query",
			perPage = 20,
			page = params.page
		);
	}

	public void function new() {
		user = model("User").new();
	}

	public any function create() {
		user = model("User").new(params.user);
		if (user.save()) {
			flashInsert(message = "The #user.name# has been saved.", messageType = "success");
			return redirectTo(route = "users");
		} else {
			flashInsert(message = "There was a problem creating this user.", messageType = "error");
			renderView(action = "new");
		}
	}
}
