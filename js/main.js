var login = (function (lightdm) {
	var user = document.getElementById('user'),
		pass = document.getElementById('password'),
		user_list = document.getElementById('user-list'),
		default_avatar = 'images/default-avatar.png',
		selected_user = null,
		password = null,
		debug = false;

	// Private functions
	var debug_msg = function(msg) {
		if (debug) {
			document.body.insertAdjacentHTML(
				'beforeend',
				'<p class="debug">DEBUG: '+msg+'</p>'
			);
		}
	}

	var setup_users_list = function () {
		debug_msg('setup_users_list() called');

		var list = user_list;
		for (var i = 0; lightdm.users.length > 1 && i < lightdm.users.length; i++) {
			if (lightdm.users.hasOwnProperty(i)) {
				var username = lightdm.users[i].name;
				var fullname = get_user_full_name(lightdm.users[i]);

				list.insertAdjacentHTML(
					'beforeend',
					'<li id="user-'+username+'">'+fullname+'</li>'
				);

				// Set an event handler to switch the user on click
				(function(username, i) {
					document.getElementById('user-'+username).addEventListener('click', function (e) {
						debug_msg('Switching to user '+username);
						select_user_from_list(i);
					})
				}(username, i));

				debug_msg('User `'+username+'` found');
			}
		}
	};

	var select_user_from_list = function(idx) {
		var idx = idx || 0;
		var selected_user = lightdm.users[idx].name;

		// Set this user as the user to log in
		user.value = selected_user;

		find_and_display_user_picture(idx);
		find_and_display_user_full_name(idx);

		var userlist_entry = document.getElementById('user-'+selected_user);
		if (userlist_entry) {
			// Deselect all other users
			Array.prototype.forEach.call(user_list.getElementsByClassName('selected'), function(element) {
				element.className = '';
			});

			// Mark this user as selected
			userlist_entry.className = 'selected';
		}

		if (lightdm._username) {
			lightdm.cancel_authentication();
		}

		if (selected_user !== null) {
			window.start_authentication(selected_user);
		}
	};

	var find_and_display_user_picture = function (idx) {
		var profile_image = document.getElementById('profile-image');
		var image = profile_image.getElementsByTagName('img')[0];

		profile_image.style.webkitAnimationName = "none";
		profile_image.style.animationName = "none";

		if (lightdm.users[idx].image) {
			image.src = lightdm.users[idx].image;
		} else {
			image.src = default_avatar;
		}

		setTimeout(function() {
			profile_image.style.webkitAnimationDelay = 0;
			profile_image.style.webkitAnimationName = "avatar_in";
			profile_image.style.animationDelay = 0;
			profile_image.style.animationName = "avatar_in";
		}, 1);
	};

	var find_and_display_user_full_name = function (idx) {
		var name_elements = document.getElementsByClassName('full-name');
		var name = get_user_full_name(lightdm.users[idx]);

		Array.prototype.forEach.call(name_elements, function(element) {
			element.innerHTML = name;
		});
	};

	var get_user_full_name = function (user) {
		if (user.display_name) {
			return user.display_name;
		} else if (user.real_name) {
			return user.real_name;
		} else {
			return user.name;
		}
	}

	// Functions that lightdm needs
	window.start_authentication = function (username) {
		lightdm.cancel_timed_login();
		lightdm.start_authentication(username);
	};
	window.provide_secret = function () {
		debug_msg('window.provide_secret() called');
		password = pass.value || null;

		if (password !== null) {
			debug_msg('window.provide_secret() password not null');
			lightdm.provide_secret(password);
		}
	};
	window.authentication_complete = function () {
		if (lightdm.is_authenticated) {
			debug_msg('Logged in');
			lightdm.login(
				lightdm.authentication_user,
				lightdm.default_session
			);
		}
	};

	// exposed outside of the closure
	var init = function () {
		debug_msg('init() called');

		setup_users_list();
		select_user_from_list();

		user.addEventListener('change', function (e) {
			e.preventDefault();

			var idx = e.currentTarget.selectedIndex;
			select_user_from_list(idx);
		});

		document.getElementById('login-form').addEventListener('submit', function (e) {
			debug_msg('Form submitted');
			e.preventDefault();
			window.provide_secret();
		});

		document.getElementById('shutdown').addEventListener('click', function (e) {
			debug_msg('Shutting down');
			lightdm.shutdown();
		});

		document.getElementById('reboot').addEventListener('click', function (e) {
			debug_msg('Restarting');
			lightdm.restart();
		});

		document.getElementById('sleep').addEventListener('click', function (e) {
			debug_msg('Sleeping');
			lightdm.suspend();
		});
	};

	return {
		init: init
	};
} (lightdm));

login.init();