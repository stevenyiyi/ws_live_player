/**
 * @class
 * @ignore
 */
class ErrorsBase {
    extend (errors, config) {
        if (!errors) return;

        let override = config ? config.override : false;
        let publicOnly = config ? config.publicOnly : false;


        for (const err in errors) {
            if (!Object.prototype.hasOwnProperty.call(errors, err) || (this[err] && !override)) continue;
            if (publicOnly && errors[err].indexOf('public_') === -1) continue;
            this[err] = errors[err];

        }
    }
}

export default ErrorsBase;