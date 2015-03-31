describe("TweenJS", function () {
	beforeEach(function () {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;
	});

	afterEach(function () {
		createjs.Tween.removeAllTweens();
	});

	it("should animate x to 50", function (done) {
		var obj = {x: 0};
		createjs.Tween.get(obj)
				.to({x: 50}, 25)
				.call(function () {
						  expect(obj.x).toBe(50);
						  done();
					  });
	});

	it("should animate in a specifc amount of time.", function (done) {
		var obj = {x: 0};
		var startTime = Date.now();
		createjs.Tween.get(obj)
				.to({x: 50}, 25)
				.call(function () {
						  expect(Date.now() - startTime).toBeInRange(48, 52);
						  done();
					  });
	});

	it("hasActiveTweens should return a boolean", function () {
		var obj = {x: 0};
		expect(createjs.Tween.hasActiveTweens(obj)).toBe(false);
		createjs.Tween.get(obj).to({x: 50}, 500);
		expect(createjs.Tween.hasActiveTweens(obj)).toBe(true);
	});

	it("tweens should fire change events", function (done) {
		var obj = {x: 0};
		var tween = createjs.Tween.get(obj);

		tween.on("change", function () {
			expect(true).toBe(true);
			done();
		});
		tween.to({x: 50});
	});

	it("setPaused() should work", function (done) {
		var obj = {x: 0};
		var tween = createjs.Tween.get(obj);
		var changeCount = 0;

		tween.on("change", function () {
			changeCount++;
		});
		tween.to({x: 200}, 2000);
		tween.setPaused(true);

		setTimeout(function () {
			tween.setPaused(false);
			tween.on("change", function () {
				expect(++changeCount).toBe(2);
				done();
			});
		}, 250);
	});

	it("setPosition() should work", function () {
		var obj = {x: 0};
		var tween = createjs.Tween.get(obj);

		tween.to({x: 200}, 2000);
		tween.setPaused(true);
		tween.setPosition(25);
		expect(obj.x).toBe(2.5);
	});

	it("wait() should work", function (done) {
		var startTime = Date.now();
		createjs.Tween.get({}).wait(500).call(function () {
			expect(Date.now() - startTime).toBeInRange(450, 510);
			done();
		});
	});

	it("removeAllTweens() should work", function () {
		var obj = {};

		createjs.Tween.get(obj).to({x: 50}, 100);

		expect(createjs.Tween.hasActiveTweens(obj)).toBe(true);
		createjs.Tween.removeAllTweens();
		expect(createjs.Tween.hasActiveTweens(obj)).toBe(false);
	});

	it("removeTweens() should work", function () {
		var obj = {};

		createjs.Tween.get(obj).to({x: 50}, 100);

		expect(createjs.Tween.hasActiveTweens(obj)).toBe(true);
		createjs.Tween.removeTweens(obj);
		expect(createjs.Tween.hasActiveTweens(obj)).toBe(false);
	});

	it("tweens should loop", function (done) {
		var obj = {};

		var count = 0;
		createjs.Tween.get(obj, {loop: true}).to({x: 50}, 100).call(function () {
			if (++count == 2) {
				expect(true).toBe(true);
				done();
			}
		});
	});
});
